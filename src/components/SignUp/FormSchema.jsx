import { z } from "zod"
export const formSchema = z.object({
    "first-name": z.string().trim().min(1, { message: "First name has to be filled" }),
    "last-name": z.string().trim().min(1, { message: "Last name has to be filled" }),
    email: z.string().trim().min(1, { message: "Email has to be filled" }),
    password: z.string().trim().min(1, { message: "Password has to be filled" }),
    "confirm-password": z.string().trim().min(1, { message: "Confirm password has to be filled" })
}) 
