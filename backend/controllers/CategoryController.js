const mongoose = require("mongoose");
const Course = require("../models/category");


exports.createCategory = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      mode,
      venue,
      category,
      startDate,
      endDate,
      startTime,
      endTime
    } = req.body;

    const image = req.file ? req.file.filename : null;

    const newCategory = new Course({
      title,
      description,
      price,
      mode,
      venue,
      category,
      image,
      startDate: new Date(startDate), 
      endDate: new Date(endDate),
      startTime,
      endTime
    });

    const savedCategory = await newCategory.save();
    res.status(201).json({ success: true, data: savedCategory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getCategory = async (req, res) => {
  try {
    const { type } = req.query;

    const validTypes = ["workShop", "internShip"];
    const filter = {};

    if (type) {
      if (!validTypes.includes(type)) {
        return res.status(400).json({ success: false, message: "Invalid category type" });
      }
      filter.category = type;
    }

    const categories = await Course.find(filter);
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    // Check if req.body exists, if not, initialize it as an empty object
    const body = req.body || {};
    
    const {
      title,
      description,
      price,
      mode,
      venue,
      category,
      startDate,
      endDate,
      startTime,
      endTime
    } = body;

    const updateData = {
      title,
      description,
      price,
      mode,
      venue,
      category,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      startTime,
      endTime
    };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const updatedCategory = await Course.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, data: updatedCategory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    const deletedCategory = await Course.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
