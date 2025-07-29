
"use server"

import { connectDB } from "@/lib/mongodb"; // Adjust path if necessary
import User from "@/models/User"; // Adjust path if necessary
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const register = async (values: unknown) => {
    const validatedFields = registerSchema.safeParse(values);

    if (!validatedFields.success) {
        return {
            error: "Invalid fields!",
            details: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { email, password, name } = validatedFields.data;

    try {
        await connectDB();

        const userFound = await User.findOne({ email });

        if (userFound) {
            return {
                error: "Email already exists!"
            };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Determine role: first user is admin, others are 'user'
        const existingUserCount = await User.countDocuments();
        const role = existingUserCount === 0 ? "admin" : "user";

        const newUser = new User({
          name,
          email,
          password: hashedPassword,
          role,
        });

        const savedUser = await newUser.save();
        
        return { success: `User registered successfully as ${role}!`, userId: savedUser._id.toString() };

    } catch (e: any) {
        console.error("Registration error:", e);
        console.error("Error name:", e.name);
        console.error("Error message:", e.message);
        if (e.stack) {
            console.error("Error stack:", e.stack);
        }

        if (e.name === 'ValidationError' && e.errors) {
             // Attempt to extract Mongoose validation errors
            const details: Record<string, string[]> = {};
            for (const field in e.errors) {
                details[field] = [e.errors[field].message];
            }
            return {
                error: "Validation failed. Please check your input.",
                details: details,
            };
        }
        
        // Fallback for other types of errors
        return {
            error: "An unexpected error occurred during registration. Please check server logs."
        };
    }
};
