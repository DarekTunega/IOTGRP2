// Tower Kit documentation https://tower.hardwario.com/
// SDK API description https://sdk.hardwario.com/
// Forum https://forum.hardwario.com/
//579881372451
#include <application.h>
#include <twr_module_co2.h>
#include <twr_module_battery.h>
#include <twr_radio.h>
#include <twr_led.h>
#include <twr_gpio.h>
#include <twr_scheduler.h>
#include <twr_log.h>
#include <twr_button.h>

#define DEVICE_ID "co2-sensor-001"

#define MEASUREMENT_INTERVAL_MS (1 * 60 * 1000)
#define MANUAL_MEASUREMENT_INTERVAL_MS (1 * 1000)

#define CO2_THRESHOLD_VENTILATE 800.0f
#define CO2_THRESHOLD_DANGEROUS 1600.0f

#define ONBOARD_LED_PIN TWR_GPIO_LED
#define BUTTON_PIN TWR_GPIO_BUTTON

// twr_gpio_channel_t buzzer_pin = BUZZER_PIN;
// bool buzzer_active = false;

twr_led_t onboard_led;
twr_button_t button;

uint8_t  device_id[12];
char device_id_str[25];

void co2_event_handler(twr_module_co2_event_t event, void *event_param);
void battery_event_handler(twr_module_battery_event_t event, void *event_param);
void button_event_handler(twr_button_t *self, twr_button_event_t event, void *event_param);

void button_event_handler(twr_button_t *self, twr_button_event_t event, void *event_param)
{
    (void) self;
    (void) event_param; 

    twr_log_info("APP: Button event: %i", event);

    if (event == TWR_BUTTON_EVENT_CLICK)
    {
        twr_log_info("APP: Manual measurement triggered by button press.");
        
        twr_module_co2_measure();
        twr_module_battery_measure();

       
        //twr_led_pulse(&onboard_led, 500);
    }
}


void application_init(void)
{
    // Set up device ID
    twr_device_id_get(device_id, sizeof(device_id));
    for (size_t i = 0; i < sizeof(device_id); i++)
    {
        sprintf(&device_id_str[i * 2], "%02X", device_id[i]);
    }
    device_id_str[sizeof(device_id_str) - 1] = '\0';
    
    // Initialize logging
    twr_log_init(TWR_LOG_LEVEL_DUMP, TWR_LOG_TIMESTAMP_ABS);
    twr_log_info("Initializing application...");
    twr_log_info("Device ID: %s", device_id_str);

    // Initialize onboard LED
    twr_led_init(&onboard_led, ONBOARD_LED_PIN, false, false);
    twr_led_set_mode(&onboard_led, TWR_LED_MODE_OFF);

    // Initialize Button
    twr_button_init(&button, BUTTON_PIN, TWR_GPIO_PULL_DOWN, false); 
    twr_button_set_event_handler(&button, button_event_handler, NULL);

    // twr_gpio_init(buzzer_pin);
    // twr_gpio_set_mode(buzzer_pin, TWR_GPIO_MODE_OUTPUT);
    // twr_gpio_set_output(buzzer_pin, 0); // Start with buzzer off
    // buzzer_active = false;

    // Initialize CO2 Module
    twr_module_co2_init();
    twr_module_co2_set_update_interval(MEASUREMENT_INTERVAL_MS);
    twr_module_co2_set_event_handler(co2_event_handler, NULL);

    // Initialize Battery Module
    twr_module_battery_init();
    twr_module_battery_set_update_interval(MEASUREMENT_INTERVAL_MS);
    twr_module_battery_set_event_handler(battery_event_handler, NULL);

    // Initialize Radio
    twr_radio_init(TWR_RADIO_MODE_NODE_SLEEPING);
    twr_radio_pairing_request("co2-monitor", FW_VERSION);

    twr_log_info("Initialization complete.");
}

// Handler
void co2_event_handler(twr_module_co2_event_t event, void *event_param)
{
    (void)event_param;

    float co2_ppm;
    float battery_voltage;

    if (event == TWR_MODULE_CO2_EVENT_UPDATE)
    {
        if (twr_module_co2_get_concentration_ppm(&co2_ppm))
        {
            twr_log_debug("CO2: %.1f ppm", co2_ppm);

            if (co2_ppm > CO2_THRESHOLD_DANGEROUS)
            {
                twr_log_warning("CO2 level dangerous!");
                twr_led_set_mode(&onboard_led, TWR_LED_MODE_ON);
            }
            else if (co2_ppm >= CO2_THRESHOLD_VENTILATE)
            {
                twr_log_info("CO2 level requires ventilation.");
                twr_led_set_mode(&onboard_led, TWR_LED_MODE_BLINK_FAST); // Idk should blink fast but seems like it doesnt
                // if (buzzer_active) {
                //     twr_gpio_set_output(buzzer_pin, 0);
                //     buzzer_active = false;
                //      twr_log_info("Buzzer OFF");
                // }
            }
            else // CO2 okay lvl
            {
                 twr_log_info("CO2 level acceptable.");
                // Turn LED off
                twr_led_set_mode(&onboard_led, TWR_LED_MODE_OFF);
                //  if (buzzer_active) {
                //     twr_gpio_set_output(buzzer_pin, 0);
                //     buzzer_active = false;
                //     twr_log_info("Buzzer OFF");
                // }
            }

            int battery_percentage = -1;
            if (!twr_module_battery_get_voltage(&battery_voltage))
            {
                 battery_voltage = NAN;
            }
             if (!twr_module_battery_get_charge_level(&battery_percentage))
            {
                twr_log_warning("Failed to get battery percentage.");
            }

            twr_radio_pub_co2(&co2_ppm);
            if (!isnan(battery_voltage)) {
                twr_radio_pub_battery(&battery_voltage); 
                 if (battery_percentage >= 0) {
                    twr_radio_pub_int("charge", &battery_percentage);
                 }
            }
            
            twr_radio_pub_string("device-id", device_id_str);
            twr_log_info("Published CO2: %.1f, Voltage: %.2f, Charge: %d%%, Device ID: %s", 
                          co2_ppm, battery_voltage, battery_percentage, device_id_str);

        }
        else
        {
            twr_log_error("Failed to get CO2 reading.");
             twr_led_set_mode(&onboard_led, TWR_LED_MODE_BLINK_SLOW);
        }
    }
    else if (event == TWR_MODULE_CO2_EVENT_ERROR)
    {
        twr_log_error("CO2 Module Error");
        twr_led_set_mode(&onboard_led, TWR_LED_MODE_BLINK_SLOW);
        //  if (buzzer_active) {
        //     twr_gpio_set_output(buzzer_pin, 0);
        //     buzzer_active = false;
        //     twr_log_info("Buzzer OFF due to CO2 error");
        // }
    }
}

void battery_event_handler(twr_module_battery_event_t event, void *event_param)
{
    (void)event_param;

    float voltage;
    int percentage;

    if (event == TWR_MODULE_BATTERY_EVENT_UPDATE)
    {
        if (twr_module_battery_get_voltage(&voltage) && twr_module_battery_get_charge_level(&percentage))
        {
            twr_log_debug("Battery: %.2f V (%d %%)", voltage, percentage);
        }
        else
        {
             twr_log_error("Failed to get battery reading.");
        }
    }
    else if (event == TWR_MODULE_BATTERY_EVENT_ERROR)
    {
        twr_log_error("Battery Module Error");
    }
     else if (event == TWR_MODULE_BATTERY_EVENT_LEVEL_LOW)
    {
        twr_log_warning("Battery level low");
    }
     else if (event == TWR_MODULE_BATTERY_EVENT_LEVEL_CRITICAL)
    {
        twr_log_error("Battery level critical!");
    }
}
// Base funkce z klauna XD
// void application_task(void)
// {
//     static int counter = 0;

//     // Log task run and increment counter
//     twr_log_debug("APP: Task run (count: %d)", ++counter);

//     // Plan next run of this task in 1000 ms
//     twr_scheduler_plan_current_from_now(1000);
// }
