const Invoice = require("../models/Invoice");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const sendInvoiceEmail = require("../utils/sendInvoiceEmail");

const COMPANY_INFO = {
  name: "Jay Jalaram Packaging",
  address: [
    "SR NO 64 PLOT NO 15,",
    "SAFAR INDUSTRIAL ZONE,",
    "Near Larson Plast,",
    "Shapar Veraval, Rajkot, Gujarat - 360024",
  ].join("\n"),
  gstNumber: "24AAIFJ2023L1ZJ",
  phones: ["9429315940", "6355990290"],
};

const COMPANY_LOGO_PATH = path.join(__dirname, "../../client/src/assets/logo.png");

const parseOrderItems = (order) => {
  try {
    const parsed = order.items ? JSON.parse(order.items) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const parseInvoiceItems = (invoice) => {
  try {
    const parsed = invoice.items_summary ? JSON.parse(invoice.items_summary) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const serializeInvoice = (invoice) => {
  const plainInvoice = invoice.toJSON ? invoice.toJSON() : { ...invoice };
  plainInvoice.items_summary = parseInvoiceItems(invoice);
  return plainInvoice;
};

const buildBoxDimensions = (order) => {
  if (order.box_length && order.box_width && order.box_height) {
    return `${order.box_length} x ${order.box_width} x ${order.box_height}`;
  }

  return "Standard Product Order";
};

const buildInvoiceItems = (order) => {
  if (order.order_type === "custom") {
    const total = Number(order.total_price || 0);
    const quantity = Number(order.quantity || 0);
    return [
      {
        description: `Custom Box (${buildBoxDimensions(order)})`,
        quantity,
        price: quantity > 0 ? Number((total / quantity).toFixed(2)) : total,
        total_amount: total,
      },
    ];
  }

  const orderItems = parseOrderItems(order);

  if (orderItems.length > 0) {
    return orderItems.map((item) => ({
      description: item.product_name || "Product",
      quantity: Number(item.quantity || 0),
      price: Number(item.product_price || 0),
      total_amount: Number(item.total_price || 0),
    }));
  }

  return [
    {
      description: order.Product?.name || "Product",
      quantity: Number(order.quantity || 0),
      price: Number(order.Product?.price || 0),
      total_amount: Number(order.total_price || 0),
    },
  ];
};

const generateInvoiceNumber = () => {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const randomPart = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `INV-${datePart}-${randomPart}`;
};

const getInvoiceWithAssociations = async (where) => {
  return Invoice.findOne({
    where,
    include: [
      {
        model: Order,
        include: [Product, User],
      },
      User,
    ],
    order: [["createdAt", "DESC"]],
  });
};

const getInvoiceByIdWithAssociations = async (id) => {
  return Invoice.findByPk(id, {
    include: [
      {
        model: Order,
        include: [Product, User],
      },
      User,
    ],
  });
};

function numberToWords(num) {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  num = Math.floor(num);
  if ((num = num.toString()).length > 9) return 'overflow';
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return ''; let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim() + ' Only';
}

const buildInvoicePdfBuffer = (invoice) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 20 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const items = parseInvoiceItems(invoice);
    const invoiceDate = new Date(invoice.invoice_date || invoice.createdAt);

    doc.font('Helvetica');
    // Main Border
    doc.rect(20, 20, 555, 800).stroke();

    // Title
    doc.font('Helvetica-Bold').fontSize(16).text(invoice.company_name || COMPANY_INFO.name, 20, 25, { width: 555, align: 'center' });
    doc.moveTo(20, 45).lineTo(575, 45).stroke();

    // Contact & Address
    doc.font('Helvetica').fontSize(9);
    doc.text('Contact No.', 25, 50);
    doc.text((invoice.company_phones || COMPANY_INFO.phones.join(", ")), 25, 62, { width: 150 });
    
    doc.text((invoice.company_address || COMPANY_INFO.address).replace(/\n/g, ", "), 200, 50, { width: 375, align: 'center' });
    doc.moveTo(20, 75).lineTo(575, 75).stroke();

    // Memo line
    doc.text('Debit Memo', 25, 80);
    doc.font('Helvetica-Bold').fontSize(11).text('TAX INVOICE', 200, 80, { width: 195, align: 'center' });
    doc.font('Helvetica').fontSize(9).text('Original', 530, 80);
    doc.moveTo(20, 95).lineTo(575, 95).stroke();

    // Splitting line
    doc.moveTo(350, 95).lineTo(350, 180).stroke();

    // Left side: M/s. details
    doc.text('M/s. : ', 25, 100, { continued: true }).font('Helvetica-Bold').text(invoice.customer_name || 'Customer');
    doc.font('Helvetica');
    if (invoice.customer_address) {
        doc.text(invoice.customer_address, 45, 115, { width: 300, height: 25 });
    }
    
    doc.text(`Place of Supply : Gujarat`, 25, 145);
    doc.text(`GSTIN No. : -`, 25, 155);
    doc.text(`E Way Bill No :`, 25, 165);

    // Right side: Invoice details
    doc.text(`Invoice No.  :  ${invoice.invoice_number}`, 355, 100);
    doc.text(`Date         :  ${invoiceDate.toLocaleDateString("en-IN")}`, 355, 112);
    doc.moveTo(350, 125).lineTo(575, 125).stroke();
    
    doc.text(`Transport    : `, 355, 130);
    doc.text(`Vehicle No   : `, 355, 142);
    doc.text(`L.R.No.      : `, 355, 154);
    doc.text(`E Way Bill Date :  /  /`, 355, 166);
    
    doc.moveTo(20, 180).lineTo(575, 180).stroke();

    // Table Headers
    doc.font('Helvetica-Bold').fontSize(8);
    const tableTop = 180;
    doc.text('SrNo', 22, tableTop + 5, { width: 25, align: 'center' });
    doc.text('Product Name', 50, tableTop + 5, { width: 200, align: 'center' });
    doc.text('HSN/SAC', 250, tableTop + 5, { width: 45, align: 'center' });
    doc.text('Qty', 295, tableTop + 5, { width: 55, align: 'center' });
    doc.text('Unit', 350, tableTop + 5, { width: 30, align: 'center' });
    doc.text('Rate', 380, tableTop + 5, { width: 50, align: 'center' });
    doc.text('GST%', 430, tableTop + 5, { width: 40, align: 'center' });
    doc.text('Amount', 470, tableTop + 5, { width: 100, align: 'center' });

    doc.moveTo(20, 195).lineTo(575, 195).stroke();

    const colX = [48, 250, 295, 350, 380, 430, 470];
    colX.forEach(x => {
        doc.moveTo(x, 180).lineTo(x, 600).stroke();
    });

    // Items
    doc.font('Helvetica').fontSize(8);
    let rowY = 200;
    let totalQty = 0;
    let subTotal = 0;

    items.forEach((item, i) => {
        const qty = Number(item.quantity || 0);
        const rate = Number(item.price || 0);
        const amount = Number(item.total_amount || 0);
        totalQty += qty;
        subTotal += amount;

        doc.text((i+1).toString(), 22, rowY, { width: 25, align: 'center' });
        doc.text(item.description || "Product", 52, rowY, { width: 195, align: 'left' });
        doc.text('4819', 250, rowY, { width: 45, align: 'center' });
        doc.text(qty.toFixed(3), 295, rowY, { width: 52, align: 'right' });
        doc.text('Nos', 350, rowY, { width: 30, align: 'center' });
        doc.text(rate.toFixed(2), 380, rowY, { width: 47, align: 'right' });
        doc.text('18.0', 430, rowY, { width: 37, align: 'right' });
        doc.text(amount.toFixed(2), 470, rowY, { width: 100, align: 'right' });
        
        rowY += 20;
    });

    if (invoice.box_dimensions && items.length === 1 && invoice.box_dimensions !== "Standard Product Order") {
        doc.text(`[${invoice.box_dimensions}]`, 52, rowY - 10, { width: 195, align: 'left' });
    }

    doc.moveTo(20, 600).lineTo(575, 600).stroke();

    // Totals line
    doc.text('Total Qty', 250, 605, { width: 45, align: 'center' });
    doc.font('Helvetica-Bold');
    doc.text(totalQty.toFixed(3), 295, 605, { width: 52, align: 'right' });
    doc.font('Helvetica');

    doc.moveTo(20, 620).lineTo(575, 620).stroke();

    doc.moveTo(430, 600).lineTo(430, 820).stroke(); 

    // Right column bottom details
    doc.text('Sub Total', 435, 605);
    doc.text(subTotal.toFixed(2), 470, 605, { width: 100, align: 'right' });

    doc.moveTo(430, 620).lineTo(575, 620).stroke();

    doc.text('Note :', 25, 625);
    doc.moveTo(20, 640).lineTo(430, 640).stroke();

    // Bank Details
    doc.text('Bank Name', 25, 645); doc.text(': BANK OF INDIA', 90, 645);
    doc.text('Bank A/c. No.', 25, 657); doc.text(': 312320110000843', 90, 657);
    doc.text('RTGS/IFSC Code', 25, 669); doc.text(': BKID0003123', 90, 669);
    doc.text('Branch Name', 250, 645); doc.text(': SHAPAR (VERAVAL)', 310, 645);

    doc.moveTo(20, 685).lineTo(430, 685).stroke();

    // Calculate taxes
    const gstRate = 0.18; // Fixed 18% as per previous
    const totalGstAmount = subTotal * gstRate;
    const cgst = totalGstAmount / 2;
    const sgst = totalGstAmount / 2;
    const grandTotal = subTotal + totalGstAmount;

    doc.text('Total GST :', 25, 690);
    doc.font('Helvetica-Bold').text(numberToWords(totalGstAmount), 90, 690);

    doc.font('Helvetica').text('Bill Amount :', 25, 710);
    doc.font('Helvetica-Bold').text(numberToWords(grandTotal), 90, 710);

    doc.moveTo(20, 740).lineTo(575, 740).stroke();

    // Right Column tax and totals
    doc.font('Helvetica').text('Taxable Amount', 435, 645); doc.text(subTotal.toFixed(2), 470, 645, { width: 100, align: 'right' });
    doc.text('Central Tax', 435, 657); doc.text(cgst.toFixed(2), 470, 657, { width: 100, align: 'right' });
    doc.text('State/UT Tax', 435, 669); doc.text(sgst.toFixed(2), 470, 669, { width: 100, align: 'right' });

    doc.moveTo(430, 700).lineTo(575, 700).stroke();
    doc.font('Helvetica-Bold').fontSize(9).text('Grand Total', 435, 710); doc.text(grandTotal.toFixed(2), 470, 710, { width: 100, align: 'right' });

    // Terms
    doc.font('Helvetica').fontSize(7);
    doc.text('Terms & Condition :', 25, 745);
    doc.text('1. Goods once sold will not be taken back.', 25, 755);
    doc.text('2. Interest @18% p.a. will be charged if payment is not made within due date.', 25, 765);
    doc.text('3. Our risk and responsibility ceases as soon as the goods leave our premises.', 25, 775);
    doc.text('4. "E.&.O.E."', 25, 785);

    doc.fontSize(8).text('For, ' + (invoice.company_name || COMPANY_INFO.name), 430, 745, { width: 140, align: 'center' });

    doc.text(`GSTIN No.:  ${invoice.gst_number || COMPANY_INFO.gstNumber}`, 25, 805);
    doc.text('PAN No.: AAIFJ2023L', 200, 805);

    doc.text('(Authorised Signatory)', 430, 805, { width: 140, align: 'center' });

    doc.end();
  });

const createInvoiceForOrder = async (orderId) => {
  const existingInvoice = await getInvoiceWithAssociations({ order_id: orderId });

  if (existingInvoice) {
    return existingInvoice;
  }

  const order = await Order.findByPk(orderId, {
    include: [Product, User],
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== "Completed") {
    throw new Error("Invoice can only be generated for completed orders");
  }

  const invoiceItems = buildInvoiceItems(order);
  const totalAmount = Number(order.total_price || 0);
  const totalQuantity = Number(order.quantity || 0);
  const price = totalQuantity > 0 ? Number((totalAmount / totalQuantity).toFixed(2)) : totalAmount;

  const invoice = await Invoice.create({
    order_id: order.id,
    user_id: order.user_id,
    invoice_number: generateInvoiceNumber(),
    invoice_date: new Date(),
    company_name: COMPANY_INFO.name,
    company_address: COMPANY_INFO.address,
    gst_number: COMPANY_INFO.gstNumber,
    company_phones: COMPANY_INFO.phones.join(", "),
    customer_name: order.customer_name || order.User?.name || "Customer",
    customer_phone: order.customer_phone || order.User?.phone || "",
    customer_address: order.User?.address || "",
    box_dimensions: buildBoxDimensions(order),
    quantity: totalQuantity,
    price,
    total_amount: totalAmount,
    is_shared_with_customer: false,
    shared_at: null,
    items_summary: JSON.stringify(invoiceItems),
  });

  return getInvoiceByIdWithAssociations(invoice.id);
};

exports.generateInvoice = async (req, res) => {
  try {
    const orderId = req.params.orderId || req.body.order_id;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const invoice = await createInvoiceForOrder(orderId);
    res.status(201).json(serializeInvoice(invoice));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      where: {
        user_id: req.user.id,
        is_shared_with_customer: true,
      },
      include: [
        {
          model: Order,
          include: [Product],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(invoices.map(serializeInvoice));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      include: [
        {
          model: Order,
          include: [Product, User],
        },
        User,
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(invoices.map(serializeInvoice));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await getInvoiceByIdWithAssociations(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (req.user.role !== "admin" && invoice.user_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(serializeInvoice(invoice));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.downloadInvoicePdf = async (req, res) => {
  try {
    const invoice = await getInvoiceByIdWithAssociations(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (
      req.user.role !== "admin" &&
      (invoice.user_id !== req.user.id || !invoice.is_shared_with_customer)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const pdfBuffer = await buildInvoicePdfBuffer(invoice);
    const shouldDownload = req.query.download === "1";
    const fileName = `${invoice.invoice_number}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `${shouldDownload ? "attachment" : "inline"}; filename="${fileName}"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.shareInvoiceToCustomer = async (req, res) => {
  try {
    const invoice = await getInvoiceByIdWithAssociations(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const customerEmail =
      invoice.User?.email || invoice.Order?.User?.email || invoice.customer_email;
    if (!customerEmail) {
      return res.status(400).json({
        message: "Customer email is missing. Please update the customer email.",
      });
    }

    invoice.is_shared_with_customer = true;
    invoice.shared_at = new Date();
    await invoice.save();

    let emailMessage = "Invoice shared with customer successfully";
    try {
      const pdfBuffer = await buildInvoicePdfBuffer(invoice);
      await sendInvoiceEmail({
        to: customerEmail,
        customerName: invoice.customer_name || invoice.User?.name,
        invoiceNumber: invoice.invoice_number,
        invoiceDate: invoice.invoice_date || invoice.createdAt,
        totalAmount: invoice.total_amount,
        pdfBuffer,
        pdfFileName: `${invoice.invoice_number || "invoice"}.pdf`,
        items: parseInvoiceItems(invoice),
      });
    } catch (error) {
      console.log("Failed to send invoice email:", error.message);
      emailMessage =
        "Invoice shared, but email could not be sent. Please check email settings.";
    }

    res.json({
      message: emailMessage,
      invoice: serializeInvoice(invoice),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createInvoiceForOrder = createInvoiceForOrder;
module.exports.serializeInvoice = serializeInvoice;
