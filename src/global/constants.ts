import { MedicalExaminations, Sex } from '../api/reservation'

export const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/

export const EXAMINATION_TYPE: Record<MedicalExaminations, string> = {
  ct: 'CT',
  mri: 'MRI',
  x_ray: 'X-ray',
  ultrasound: 'Ultrasound',
  blood_test: 'Blood test'
}

export const SEX_TYPE: Record<Sex, string> = {
  male: 'Male',
  female: 'Female'
}
