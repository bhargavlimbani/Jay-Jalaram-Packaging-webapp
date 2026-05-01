const Product = require("../models/Product");
const ProductType = require("../models/ProductType");

const parseProductNumbers = ({ price, stock }) => {
  const parsedPrice = Number(price);
  const parsedStock = Number(stock);

  if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
    return { error: "Please enter a valid product price" };
  }

  if (!Number.isInteger(parsedStock) || parsedStock < 0) {
    return { error: "Please enter a valid stock quantity" };
  }

  return { parsedPrice, parsedStock };
};

// Create Product (Admin only)
exports.createProduct = async (req, res) => {
  try {
    const { box_type, name, description, image_data, price, stock } = req.body;
    const normalizedName = String(name || "").trim();
    const parsedValues = parseProductNumbers({ price, stock });

    if (!normalizedName) {
      return res.status(400).json({ message: "Product name is required" });
    }

    if (parsedValues.error) {
      return res.status(400).json({ message: parsedValues.error });
    }

    const type = await ProductType.findOne({ where: { value: box_type } });
    if (!type) {
      return res.status(400).json({ message: "Please select a valid box type" });
    }

    const product = await Product.create({
      box_type,
      name: normalizedName,
      description,
      image_data,
      price: parsedValues.parsedPrice,
      stock: parsedValues.parsedStock,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Products (Public)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Product (Admin only)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { box_type, name, description, image_data, price, stock } = req.body;
    const normalizedName = String(name || "").trim();
    const parsedValues = parseProductNumbers({ price, stock });

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!normalizedName) {
      return res.status(400).json({ message: "Product name is required" });
    }

    if (parsedValues.error) {
      return res.status(400).json({ message: parsedValues.error });
    }

    const type = await ProductType.findOne({ where: { value: box_type } });
    if (!type) {
      return res.status(400).json({ message: "Please select a valid box type" });
    }

    await product.update({
      box_type,
      name: normalizedName,
      description,
      image_data,
      price: parsedValues.parsedPrice,
      stock: parsedValues.parsedStock,
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Product (Admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.destroy();

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Low Stock Products (Admin Dashboard)
exports.getLowStockProducts = async (req, res) => {
  try {
    const lowStockProducts = await Product.findAll({
      where: {
        stock: {
          [require("sequelize").Op.lt]: 10, // less than 10
        },
      },
    });

    res.json(lowStockProducts);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
