const ProductType = require("../models/ProductType");

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

exports.getProductTypes = async (req, res) => {
  try {
    const types = await ProductType.findAll({ order: [["label", "ASC"]] });
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProductType = async (req, res) => {
  try {
    const { label, value } = req.body || {};
    const safeLabel = (label || "").trim();
    if (!safeLabel) {
      return res.status(400).json({ message: "Type name is required." });
    }

    const slug = (value || slugify(safeLabel)).trim();
    if (!slug) {
      return res.status(400).json({ message: "Type value is required." });
    }

    const existing = await ProductType.findOne({ where: { value: slug } });
    if (existing) {
      return res.status(400).json({ message: "Type already exists." });
    }

    const type = await ProductType.create({ label: safeLabel, value: slug });
    res.status(201).json(type);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
