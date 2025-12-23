import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" })
    .trim(),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    // .min(8, { message: "Password must be at least 8 characters" })
    .max(12, { message: "Password must be not more than 12 characters" }),
});
export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" })
    .max(20, { message: "Password must be not more than 20 characters" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      }
    ),
});

export const SignupSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(20, { message: "Name must be at most 20 characters" })
    .nonempty({ message: "Name is required" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" })
    .trim(),
  mobile: z
    .string()
    .min(1, { message: "Mobile number is required" })
    .regex(/^\d+$/, { message: "Mobile number must contain only digits" })
    .min(10, { message: "Mobile number must be at least 10 digits" })
    .max(10, { message: "Mobile number must be at most 10 digits" }),
});

export const ForgetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" })
    .trim(),
});
export const ReviewSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" })
    .trim(),
  review: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(200, "Description must be at most 200 characters long"),
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(20, { message: "Name must be at most 20 characters" })
    .nonempty({ message: "Name is required" }),
});
export const OffersDescriptionSchema = z.object({
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(100, "Description must be at most 100 characters long"),
});

export const jobFormSchema = z.object({
  // jobTitle: z.string().min(1, "Job Title is required"),
  jobTitle: z
    .string()
    .min(10, "jobTitle must be at least 10 characters long")
    .max(40, "jobTitle must be at most 40 characters long"),
  workType: z.string().min(1, { message: "Work Type is required" }).trim(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long")
    .max(200, "Description must be at most 200 characters long"),
  keySkill: z.string().min(1, "Key Skill is required"),
  vancancy: z.string().min(1, { message: "Vancancy is required" }).trim(),
  noOfopening: z
    .string({ invalid_type_error: "No Of Opening must be a number" })
    .min(1, "At least one opening is required"),
  salaryRange: z.string().min(1, "Salary Range is required"),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required" }),
    newPassword: z
      .string()
      .min(8, { message: "New password must be at least 8 characters" })
      .max(20, { message: "New password must be at most 20 characters" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        {
          message:
            "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        }
      ),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export const CourseSchema = z.object({
  courseName: z
    .string()
    .min(3, "Course Name must be at least 3 characters long")
    .max(30, "Course Name must be at most 30 characters long"),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters long")
    .max(200, "Description must be at most 200 characters long"),
  prize: z.string().min(1, "Prize is required"),
  duration: z
    .string()
    .min(1, "Duration is required")
    .max(20, "Course Name must be at most 10 characters long")
    .regex(
      /^[A-Za-z0-9\s]+$/,
      "Duration must contain only alphabets, numbers, and spaces"
    ),
  discount: z
    .string()
    .optional()
    .refine((value) => !value || (Number(value) >= 1 && Number(value) <= 100), {
      message: "Discount must be between 1 and 100 if provided",
    }),
  showOnLandingPage: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timing: z.string().optional(),
  thumbnail: z
    .any()
    .refine(
      (value) => {
        if (value instanceof File) return true;
        if (typeof value === "object" && value && "filename" in value)
          return true;
        return false;
      },
      {
        message: "Image is required",
      }
    )
    .refine(
      (value) => {
        if (value instanceof File) {
          return value.size <= 5 * 1024 * 1024;
        }
        return true;
      },
      {
        message: "Max file size is 5MB",
      }
    )
    .refine(
      (value) => {
        if (value instanceof File) {
          return [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
          ].includes(value.type);
        }
        // Skip validation for existing uploads
        return true;
      },
      {
        message: "Only JPG, JPEG, PNG, or WEBP files are allowed",
      }
    ),
});

export const CategorySchema = z
  .object({
    category: z.string().min(1, "Category is required"),
    title: z
      .string()
      .min(3, "Title must be at least 3 characters long")
      .max(50, "Title must be at most 50 characters long"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters long")
      .max(200, "Description must be at most 200 characters long"),
    prize: z.string().min(1, "Prize is required"),
    mode: z.string().min(1, "Mode is required"),
    venue: z
      .string()
      .min(3, "Venue must be at least 3 characters long")
      .max(100, "Venue must be at most 100 characters long"),
    startDate: z.date({
      required_error: "Start date is required",
      invalid_type_error: "Please select a valid start date",
    }),
    endDate: z.date({
      required_error: "End date is required",
      invalid_type_error: "Please select a valid end date",
    }),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    image: z
      .any()
      .refine(
        (value) => {
          if (value instanceof File) return true;
          if (typeof value === "object" && value && "filename" in value)
            return true;
          return false;
        },
        {
          message: "Image is required",
        }
      )
      .refine(
        (value) => {
          if (value instanceof File) {
            return value.size <= 5 * 1024 * 1024;
          }
          return true;
        },
        {
          message: "Max file size is 5MB",
        }
      )
      .refine(
        (value) => {
          if (value instanceof File) {
            return [
              "image/png",
              "image/jpeg",
              "image/jpg",
              "image/webp",
            ].includes(value.type);
          }
          // Skip validation for existing uploads
          return true;
        },
        {
          message: "Only JPG, JPEG, PNG, or WEBP files are allowed",
        }
      ),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be after or equal to start date",
    path: ["endDate"],
  })
  .refine(
    (data) => {
      // If start and end dates are the same, check if end time is after start time
      if (data.startDate.toDateString() === data.endDate.toDateString()) {
        const startTime = data.startTime.split(":");
        const endTime = data.endTime.split(":");
        const startMinutes =
          parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
        const endMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);
        return endMinutes > startMinutes;
      }
      return true;
    },
    {
      message: "End time must be after start time when dates are the same",
      path: ["endTime"],
    }
  );

export const contactUsSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(20, { message: "Name must be at most 20 characters" })
    .nonempty({ message: "Name is required" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" })
    .trim(),
  mobile: z
    .string()
    .min(1, { message: "Mobile number is required" })
    .regex(/^\d+$/, { message: "Mobile number must contain only digits" })
    .min(10, { message: "Mobile number must be at least 10 digits" })
    .max(10, { message: "Mobile number must be at most 10 digits" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" })
    .max(200, { message: "Description must be at most 200 characters" }),
});
export const carrersWebSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(20, { message: "Name must be at most 20 characters" })
    .nonempty({ message: "Name is required" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" })
    .trim(),
  mobile: z
    .string()
    .min(1, { message: "Mobile number is required" })
    .regex(/^\d+$/, { message: "Mobile number must contain only digits" })
    .min(10, { message: "Mobile number must be at least 10 digits" })
    .max(10, { message: "Mobile number must be at most 10 digits" }),
});
export const carrersWebSchemaNew = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(20, { message: "Name must be at most 20 characters" })
    .nonempty({ message: "Name is required" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" })
    .trim(),
  mobile: z
    .string()
    .min(1, { message: "Mobile number is required" })
    .regex(/^\d+$/, { message: "Mobile number must contain only digits" })
    .min(10, { message: "Mobile number must be at least 10 digits" })
    .max(10, { message: "Mobile number must be at most 10 digits" }),
  // resume: z
  //   .any()
  //   .refine(
  //     (value) => {
  //       if (value instanceof File) return true;
  //       if (typeof value === "object" && value && "filename" in value)
  //         return true;
  //       return false;
  //     },
  //     {
  //       message: "Image is required",
  //     }
  //   )
  //   .refine(
  //     (value) => {
  //       if (value instanceof File) {
  //         return value.size <= 1000 * 1024;
  //       }
  //       return true;
  //     },
  //     {
  //       message: "Max file size is 1000KB",
  //     }
  //   )
  //   .refine(
  //     (value) => {
  //       if (value instanceof File) {
  //         return [
  //           "application/pdf",
  //           "application/msword",
  //           "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  //         ].includes(value.type);
  //       }
  //       // Skip validation for existing uploads
  //       return true;
  //     },
  //     {
  //       message: "Only PDF, DOC, or DOCX files are allowed",
  //     }
  //   ),
});
