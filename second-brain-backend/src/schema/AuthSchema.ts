import {z} from "zod";

export const requiredSchema = z.object({
    username: z
    .string()
    .min(3, "username must be atleast 3 characters long")
    .max(20, "username can not be longer than 20 characters"), 
    
    password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(20, "Password can not be longer than 20 characters")
    .refine(password => /[A-Z]/.test(password), {
        message: "Password must contain at least one uppercase letter.",
    })
    .refine(password => /[a-z]/.test(password), {
        message: "Password must contain at least one lowercase letter.",
    })
    .refine(password => /[0-9]/.test(password), {
        message: "Password must contain at least one number.",
    })
    .refine(password => /[!@#$%^&*?]/.test(password), {
        message: "Password must contain at least one special character.",
    })
})

export const signinSchema = z.object({
    username: z.string(),
    password: z.string()
})


