import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

type Customization = {
  title: string;
  description: string;
};

type RequestBody = {
  amount: string;
  currency: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  tx_ref: string;
  callback_url: string;
  return_url: string;
  customization: Customization;
};

// Named export for the POST method
export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    // console.log(body)
    const {
      amount,
      currency,
      email,
      first_name,
      last_name,
      phone_number,
      tx_ref,
      callback_url,
      return_url,
      customization,
    } = body;

    const header = {
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    };

    const paymentBody = {
      amount,
      currency,
      email,
      first_name,
      last_name,
      phone_number,
      tx_ref,
      callback_url,
      return_url,
      customization: {
        title: customization.title,
        description: customization.description,
      },
    };

    const resp = await axios
      .post(
        "https://api.chapa.co/v1/transaction/initialize",
        paymentBody,
        header
      )
      .catch((error) => {
        if (axios.isAxiosError(error) && error.response) {
          console.error("Error response:", error.response.data);
        } else if (error.request) {
          console.error("Error request:", error.request);
        } else {
          console.error("Error message:", error.message);
        }
        throw error;
      });

    return NextResponse.json(resp.data, { status: 200 });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // console.log(error as Error);

      return NextResponse.json(
        { message: error.response.data },
        { status: 400 }
      );
    } else {
      console.log(error as Error);
      return NextResponse.json(
        {
          error_code: (error as Error).name,
          message: (error as Error).message,
        },
        { status: 400 }
      );
    }
  }
}
