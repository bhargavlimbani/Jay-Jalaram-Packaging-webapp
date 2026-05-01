const Material = require("../models/Material");

const normalizeName = (value = "") => value.trim();

exports.getMaterials = async (req, res) => {
  try {
    const materials = await Material.findAll({ order: [["name", "ASC"]] });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: "Unable to load materials" });
  }
};

exports.createMaterial = async (req, res) => {
  try {
    const { name, unit, quantity, unit_price } = req.body;
    const materialName = normalizeName(name);

    if (!materialName) {
      return res.status(400).json({ message: "Material name is required" });
    }

    const material = await Material.create({
      name: materialName,
      unit: unit?.trim() || "kg",
      quantity: Number(quantity || 0),
      unit_price: Number(unit_price || 0),
    });

    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ message: "Unable to add material" });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id);

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    const { name, unit, quantity, unit_price } = req.body;

    await material.update({
      name: normalizeName(name || material.name),
      unit: unit?.trim() || material.unit,
      quantity: Number(quantity ?? material.quantity),
      unit_price: Number(unit_price ?? material.unit_price),
    });

    res.json(material);
  } catch (error) {
    res.status(500).json({ message: "Unable to update material" });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id);

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    await material.destroy();
    res.json({ message: "Material deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Unable to delete material" });
  }
};
