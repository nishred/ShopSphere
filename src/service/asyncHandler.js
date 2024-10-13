// const asyncHandler = (func) => () => {}

// const asyncHanlder = (func) => async () => {}

// A function that returns a function or takes other function as an argument is called as a higher order function.

const asyncHandler = (fn) => async (req,res,next) => {

  try {

    await fn(req,res,next)

  }
  catch(error)
  {
    res.status(error.code || 500).json({
       success :  false,
       message : error.message
    })

  }
 
}

export default asyncHandler

