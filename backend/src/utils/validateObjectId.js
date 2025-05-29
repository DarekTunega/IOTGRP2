import mongoose from 'mongoose';

const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Neplatné ID formátu MongoDB.' });
  }

  next();
};

export default validateObjectId;
