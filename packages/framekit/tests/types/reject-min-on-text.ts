import { field } from '@mauriciodmo/framekit'

field.text({
  label: 'Name',
  // @ts-expect-error min is not allowed on text fields
  min: 3,
})
