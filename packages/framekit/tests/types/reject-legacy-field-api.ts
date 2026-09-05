import { field } from '@mauriciodmo/framekit'

// @ts-expect-error the plural field namespace was removed
import { fields } from '@mauriciodmo/framekit'

// @ts-expect-error textarea is not a canonical field kind
void field.textarea

void fields
