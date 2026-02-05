const express = require("express");
const router = express.Router();
const Billing = require("../models/Billing");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const { protect, authorize } = require("../middleware/auth");

// @route   POST /api/billing
// @desc    Create a new bill (Admin only)
// @access  Private/Admin
router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    const { patientId, appointmentId, items, tax, discount } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const taxAmount = tax || 0;
    const discountAmount = discount || 0;
    const totalAmount = subtotal + taxAmount - discountAmount;

    const billing = await Billing.create({
      patient: patientId,
      appointment: appointmentId,
      items,
      subtotal,
      tax: taxAmount,
      discount: discountAmount,
      totalAmount,
    });

    const populatedBilling = await Billing.findById(billing._id)
      .populate({
        path: "patient",
        populate: {
          path: "userId",
          select: "name email phone",
        },
      })
      .populate("appointment");

    res.status(201).json(populatedBilling);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/", protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "patient") {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (patient) {
        query.patient = patient._id;
      }
    }

    const bills = await Billing.find(query)
      .populate("patient", "userId")
      .populate("appointment")
      .sort({ createdAt: -1 });

    res.json(bills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id)
      .populate("patient", "userId")
      .populate("appointment");

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    res.json(bill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id/payment", protect, async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    const { paymentStatus, paymentMethod } = req.body;
    if (paymentStatus) bill.paymentStatus = paymentStatus;
    if (paymentMethod) bill.paymentMethod = paymentMethod;
    if (paymentStatus === "paid") {
      bill.paymentDate = new Date();
    }

    await bill.save();
    const updatedBill = await Billing.findById(bill._id)
      .populate("patient", "userId")
      .populate("appointment");

    res.json(updatedBill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/stats/revenue", protect, authorize("admin"), async (req, res) => {
  try {
    const totalRevenue = await Billing.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const monthlyRevenue = await Billing.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
