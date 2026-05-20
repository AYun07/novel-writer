import { useState, useCallback } from 'react'

export const validators = {
  required: (value, message = '此字段为必填项') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return message
    }
    return null
  },

  minLength: (min, message) => (value) => {
    if (value && value.length < min) {
      return message || `至少需要 ${min} 个字符`
    }
    return null
  },

  maxLength: (max, message) => (value) => {
    if (value && value.length > max) {
      return message || `最多只能输入 ${max} 个字符`
    }
    return null
  },

  email: (message = '请输入有效的邮箱地址') => (value) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return message
    }
    return null
  },

  url: (message = '请输入有效的URL') => (value) => {
    if (value && !/^https?:\/\/.+/.test(value)) {
      return message
    }
    return null
  },

  number: (message = '请输入数字') => (value) => {
    if (value && isNaN(Number(value))) {
      return message
    }
    return null
  },

  positiveNumber: (message = '请输入正数') => (value) => {
    if (value && (isNaN(Number(value)) || Number(value) <= 0)) {
      return message
    }
    return null
  },

  pattern: (regex, message) => (value) => {
    if (value && !regex.test(value)) {
      return message || '格式不正确'
    }
    return null
  },

  match: (fieldName, getValue, message) => (value) => {
    if (value !== getValue()) {
      return message || `与 ${fieldName} 不匹配`
    }
    return null
  },

  custom: (validatorFn, message) => (value) => {
    try {
      const result = validatorFn(value)
      return result ? (message || result) : null
    } catch (error) {
      return message || '验证失败'
    }
  }
}

export function useFormValidation(initialValues = {}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }, [])

  const validateField = useCallback((name, value, rules = []) => {
    for (const rule of rules) {
      const error = rule(value)
      if (error) {
        setFieldError(name, error)
        return error
      }
    }
    setFieldError(name, null)
    return null
  }, [setFieldError])

  const handleChange = useCallback((name, rules = []) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setValue(name, value)
    
    if (touched[name]) {
      validateField(name, value, rules)
    }
  }, [name, rules, setValue, touched, validateField])

  const handleBlur = useCallback((name, rules = []) => (e) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))
    
    validateField(name, values[name], rules)
  }, [name, rules, values, validateField])

  const handleSubmit = useCallback((onSubmit, rules = {}) => (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const newErrors = {}
    let isValid = true

    Object.keys(rules).forEach(fieldName => {
      const fieldRules = rules[fieldName]
      const error = fieldRules.reduce((acc, rule) => {
        return acc || rule(values[fieldName])
      }, null)
      
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    setTouched(
      Object.keys(rules).reduce((acc, key) => {
        acc[key] = true
        return acc
      }, {})
    )

    if (isValid) {
      onSubmit(values)
    }

    setIsSubmitting(false)
    return isValid
  }, [values, rules])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const isValid = Object.keys(errors).every(key => !errors[key])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setFieldError,
    handleChange,
    handleBlur,
    handleSubmit,
    validateField,
    reset,
    clearErrors
  }
}

export function useFieldValidation(value, rules = []) {
  const [error, setError] = useState(null)
  const [isValidating, setIsValidating] = useState(false)

  const validate = useCallback(() => {
    setIsValidating(true)
    
    for (const rule of rules) {
      const result = rule(value)
      if (result) {
        setError(result)
        setIsValidating(false)
        return result
      }
    }
    
    setError(null)
    setIsValidating(false)
    return null
  }, [value, rules])

  return {
    error,
    isValidating,
    isValid: !error,
    validate
  }
}
