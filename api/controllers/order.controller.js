

const Order = require("../model/order.model")

module.exports={
    newOrder:async(req,res)=>{
        console.log(req.body);
        
        try {
            // Validate payment method
            const validPaymentMethods = ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'pay_later'];
            if (!validPaymentMethods.includes(req.body.payment)) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Invalid payment method. Please select a valid payment option."
                });
            }
            
            // Process payment based on method
            let paymentProcessed = false;
            
            switch(req.body.payment) {
                case 'credit_card':
                case 'debit_card':
                    // In a real app, this would integrate with a payment gateway
                    console.log(`Processing ${req.body.payment} payment`);
                    paymentProcessed = true;
                    break;
                case 'paypal':
                    // In a real app, this would redirect to PayPal
                    console.log('Processing PayPal payment');
                    paymentProcessed = true;
                    break;
                case 'bank_transfer':
                    // In a real app, this would provide bank details
                    console.log('Processing bank transfer');
                    paymentProcessed = true;
                    break;
                case 'pay_later':
                    // No immediate payment processing needed
                    console.log('Payment deferred - Pay Later option selected');
                    paymentProcessed = true;
                    break;
            }
            
            if (!paymentProcessed) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Payment processing failed. Please try again or choose a different payment method."
                });
            }
            
            // Create and save the order
            const order = new Order(req.body);
            const savedData = await order.save();
            
            res.status(200).json({ 
                success: true, 
                data: savedData,
                message: "Order placed successfully!"
            });
        } catch (error) {
            console.error("Order creation error:", error);
            res.status(400).json({ 
                success: false, 
                message: "Internal Server Error. Please try again later."
            });
        }   
    },
    getAll:(req,res)=>{
            Order.find().then(resp=>{
            res.status(200).json({ success: true, data: resp})
        }).catch(error=>{
            res.status(409).json({ success: false, message: "Server Error, Try After sometime"})
         })
        },
    getOrderByUser:(req,res)=>{
        console.log("caling", req.params.id)
      Order.find({_id:req.params.id}).then(resp=>{
        console.log("response", resp)
        res.status(200).json({success:true, data:resp[0]})
      }).catch(e=>{
        console.log('Error', e)
        res.status(409).json({success:false, message:"Error in fetching data."})
      })
    },
  
}
