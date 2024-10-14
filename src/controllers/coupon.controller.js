import asyncHandler from "../service/asyncHandler"

import { couponSchema,editCouponSchema } from "../validation/coupon.validator"

import CustomError from "../utils/CustomError"

import Coupon from "../models/coupon.schema"

import { StatusCodes } from "http-status-codes"


export const createCoupon = asyncHandler(async (req,res) => {

   
   const validatedCoupon = couponSchema.parse(req.body)
   
   const discount = validatedCoupon.discount

   if(discount < 0)
      throw new CustomError("Discount can't be negative")
   

   const coupon = new Coupon(validatedCoupon)
   
   
   const savedCoupon = await coupon.save()

   res.status(StatusCodes.CREATED).json({
      success : true,
      message : "Coupon created successfully",
      data : savedCoupon
   })


})


export const editCoupon = asyncHandler(async (req,res) => {

    const id = req.params.id

    const parsedCoupon = editCouponSchema.parse(req.body)

    const updatedCoupon = await Coupon.findByIdAndUpdate(id,{$set : {parsedCoupon}},{new : true})


    if(!updatedCoupon)
      throw new CustomError("Invalid coupon details")
        
    res.status(StatusCodes.ACCEPTED).json({
      success : true,
      message : "Coupon updated successfully",
      data : updatedCoupon
    })



})


export const deleteCoupon = asyncHandler(async (req,res) => {


    const id = req.params.id
    
    const deletedCoupon = await Coupon.findByIdAndDelete(id)

    if(!deletedCoupon)
      throw new CustomError("Please check the coupon details again",StatusCodes.BAD_REQUEST)


    res.status(StatusCodes.ACCEPTED).json({

      success : true,
      message : "The coupon has been deleted successfully",
      data : deletedCoupon


    })

})


export const getCoupons = asyncHandler(async (req,res) => {


   const coupons = await Coupon.find({})


   res.status(StatusCodes.ACCEPTED).json({
      success : true,
      message : "Coupons fetched successfully",
      data : coupons
   })
 


})


export const getCoupon = asyncHandler(async (req,res) => {


   const id = req.params.id

   const coupon = await Coupon.find({_id : id})

   if(!coupon)
      throw new CustomError("Invalid coupon id",StatusCodes.BAD_REQUEST)


   res.status(StatusCodes.ACCEPTED).json({
      success : true,
      message : "Fetched the coupon successfully",
      data : coupon

   })


})