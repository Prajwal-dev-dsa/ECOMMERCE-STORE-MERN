import Coupon from "../models/coupon.model.js";

export const getCoupon = async (req, res) => {
  try {
    // fetching the active coupon of user
    const coupon = await Coupon.findOne({
      userId: req.user._id,
      isActive: true,
    });

    // if found or not found, we return the desired response
    res
      .status(200 || 404)
      .json(coupon || { message: "No active coupon found" });
  } catch (error) {
    console.error("Error fetching coupons:", error.message);
    res
      .status(500)
      .json({ message: "Error fetching coupons", error: error.message });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body; // extracting coupon code from body

    // checking if coupon exists and is active
    const coupon = await Coupon.findOne({
      code: code,
      userId: req.user._id,
      isActive: true,
    });

    // if coupon not found
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    // if coupon isActive but expired by date
    if (coupon.expirationDate < new Date()) {
      (coupon.isActive = false), await coupon.save();
      return res.status(404).json({ message: "Coupon expired" });
    }

    // valid coupon
    res.status(200).json({
      message: "Coupon is valid",
      code: coupon.code,
      discountPercentage: coupon.discoutPercentage,
    });
  } catch (error) {
    console.error("Error validating coupon:", error.message);
    res
      .status(500)
      .json({ message: "Error validating coupon", error: error.message });
  }
};
