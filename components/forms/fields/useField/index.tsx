import { Validate } from '@components/forms/types'
import { useFormField } from '@components/forms/useFormField'
import { useCallback, useEffect, useState } from 'react'

// the purpose of this hook is to provide a way to;
// 1. allow the field to update its own value without debounce
// 2. conditionally report the updated value to the form
// 3. allow the field be controlled externally either through props or form context
// the approach is largely the same across all fields, so this hook standardizes it

export const useField = <T extends any>(props: {
  path?: string
  initialValue?: T
  onChange?: (value: T) => void // eslint-disable-line no-unused-vars
  validate?: Validate
  required?: boolean
}): {
  onChange: (value: T) => void // eslint-disable-line no-unused-vars
  value: T
  showError: boolean
  errorMessage: string
} => {
  const { path, onChange: onChangeFromProps, validate, required, initialValue } = props

  const fieldFromContext = useFormField<T>({
    path,
    validate: required ? validate : undefined,
  })

  const { value: valueFromContext, showError, setValue, errorMessage } = fieldFromContext

  const valueFromContextOrProps = valueFromContext || initialValue

  const [internalState, setInternalState] = useState<T>(valueFromContext || initialValue) // not debounced

  useEffect(() => {
    if (valueFromContextOrProps !== undefined && valueFromContextOrProps !== internalState)
      setInternalState(valueFromContextOrProps)
  }, [valueFromContextOrProps, internalState])

  const onChange = useCallback(
    (incomingValue: T) => {
      setInternalState(incomingValue)

      if (typeof setValue === 'function') {
        setValue(incomingValue)
      }

      if (typeof onChangeFromProps === 'function') {
        onChangeFromProps(incomingValue)
      }
    },
    [onChangeFromProps, setValue],
  )

  return {
    onChange,
    value: internalState,
    showError,
    errorMessage,
  }
}
