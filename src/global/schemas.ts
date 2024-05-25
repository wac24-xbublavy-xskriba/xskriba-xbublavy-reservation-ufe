import { z } from 'zod'
import dayjs from 'dayjs'

import { MedicalExaminations, Sex } from '../api/reservation'
import { TIME_REGEX } from './constants'

export const CreateAmbulanceSchema = z.object({
  id: z.string().optional(),
  name: z.string({ required_error: 'Name is required' }).trim(),
  address: z.string({ required_error: 'Address is required' }).trim(),
  medicalExaminations: z.array(z.nativeEnum(MedicalExaminations), {
    required_error: 'Medical examinations are required'
  }),
  open: z
    .string({ required_error: 'Open time is required' })
    .refine(time => TIME_REGEX.test(time), {
      message: 'Invalid time format. Expected HH:MM in 24-hour format.'
    }),
  close: z
    .string({ required_error: 'Close time is required' })
    .refine(time => TIME_REGEX.test(time), {
      message: 'Invalid time format. Expected HH:MM in 24-hour format.'
    })
})

export const CreateAmbulanceSchemaTransform = CreateAmbulanceSchema.transform(
  ({ open, close, ...data }) => ({
    ...data,
    officeHours: { open, close }
  })
)

export const CreatePatientSchema = z.object({
  id: z.string().optional(),
  firstName: z.string({ required_error: 'First name is required' }).trim(),
  lastName: z.string({ required_error: 'Last name is required' }).trim(),
  birthday: z
    .string({ required_error: 'Birthday is required' })
    .date('Birthday must be a valid date')
    .refine(
      date => {
        return dayjs(date).isBefore(dayjs())
      },
      {
        message: 'Birthday must be in the past'
      }
    ),
  sex: z.nativeEnum(Sex, { required_error: 'Sex is required' }),
  bio: z.string().default('')
})

export const CreateExaminationSchema = z.object({
  date: z
    .string({ required_error: 'Date is required' })
    .refine(
      date => {
        return dayjs(date).endOf('day').isAfter(dayjs().startOf('day'))
      },
      {
        message: 'Date must be in the future'
      }
    )
    .refine(
      date => {
        return dayjs(date).day() !== 0 && dayjs(date).day() !== 6
      },
      {
        message: 'Only working days are available for reservation'
      }
    ),
  examinationType: z.nativeEnum(MedicalExaminations, {
    required_error: 'Examination type is required',
    invalid_type_error: 'Invalid examination type'
  })
})

export const UpdateReservationSchema = z.object({
  message: z.string().optional()
})
