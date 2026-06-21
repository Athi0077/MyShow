export const processPayment = async ({
  amount,
  userName,
  userEmail
}) => {

  return new Promise((resolve, reject) => {

    const options = {
      key: "rzp_test_PV1oQ0oMtgXOsq",
      amount: amount * 100,
      currency: "INR",
      name: "MyShow",
      description: "Movie Ticket Payment",

      handler: function (response) {
        resolve({
          paymentId: response.razorpay_payment_id
        });
      },

      prefill: {
        name: userName,
        email: userEmail,
        contact: "6379981170"
      },

      theme: {
        color: "#0d3b66"
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  });
};