const paymentController = require("../controllers/paymentController");
const Order = require("../models/Order");

async function test() {
  const req = {
    body: {
      order_id: 1,
      method: "Cash",
      amount: "64.90"
    }
  };
  const res = {
    status: (code) => ({
      json: (data) => {
        console.log("Status:", code);
        console.log("Response:", data);
      }
    })
  };
  
  await paymentController.recordPayment(req, res);
}

test();
