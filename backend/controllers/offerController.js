const Offer = require("../models/Offers");

// CREATE
exports.createOffer = async (req, res) => {
  const { description, status } = req.body;

  if (!description)
    return res.status(400).json({ message: "Description is required" });

  try {
    const offer = await Offer.create({ description, status });
    res.status(201).json({ message: "Offer created", offer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL
exports.getOffers = async (req, res) => {
  try {
    const offers = await Offer.find();
    res.json(offers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.updateOffer = async (req, res) => {
  const { id } = req.params;
  const { description, status } = req.body;

  try {
    const updated = await Offer.findByIdAndUpdate(
      id,
      { description, status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Offer not found" });

    res.json({ message: "Offer updated", offer: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
exports.deleteOffer = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Offer.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Offer not found" });

    res.json({ message: "Offer deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
