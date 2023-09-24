class ApiError extends Error {
    statusCode: number
  
    constructor(statusCode: number, message: string) {
      super(message)
      this.statusCode = statusCode
    }
  }
  
  export default ApiError
  
  export const GetRates = async () => {
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD")

    const responseBody = await response.json();

    if (response.ok) {
      return responseBody;
    }
  
    throw new ApiError(response.status, responseBody["error"] || responseBody);
  };