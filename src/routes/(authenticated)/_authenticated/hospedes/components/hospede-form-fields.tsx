import type { HospedeFormState } from '@/routes/(authenticated)/_authenticated/hospedes/schemas/hospedes.schemas'
import { createEmptyAcompanhante } from '@/routes/(authenticated)/_authenticated/hospedes/schemas/hospedes.schemas'

type HospedeFormFieldsProps = {
  formState: HospedeFormState
  onChange: (nextState: HospedeFormState) => void
}

export function HospedeFormFields({ formState, onChange }: HospedeFormFieldsProps) {
  function updateField<Key extends keyof HospedeFormState>(
    key: Key,
    value: HospedeFormState[Key],
  ) {
    onChange({
      ...formState,
      [key]: value,
    })
  }

  function updateAcompanhante(
    index: number,
    nextValue: Partial<HospedeFormState['acompanhantes'][number]>,
  ) {
    onChange({
      ...formState,
      acompanhantes: formState.acompanhantes.map((acompanhante, currentIndex) =>
        currentIndex === index
          ? {
              ...acompanhante,
              ...nextValue,
            }
          : acompanhante,
      ),
    })
  }

  function addAcompanhante() {
    updateField('acompanhantes', [
      ...formState.acompanhantes,
      createEmptyAcompanhante(),
    ])
  }

  function removeAcompanhante(index: number) {
    updateField(
      'acompanhantes',
      formState.acompanhantes.filter((_, currentIndex) => currentIndex !== index),
    )
  }

  function handleCpfChange(value: string) {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 11)
    updateField('cpf', formatCpfInput(digitsOnly))
  }

  return (
    <>
      <div className="form-grid form-grid-two-columns">
        <label className="field">
          <span>Nome completo</span>
          <input
            onChange={(event) => updateField('nomeCompleto', event.target.value)}
            value={formState.nomeCompleto}
          />
        </label>

        <label className="field">
          <span>CPF</span>
          <input
            inputMode="numeric"
            maxLength={14}
            onChange={(event) => handleCpfChange(event.target.value)}
            placeholder="000.000.000-00"
            value={formState.cpf}
          />
        </label>

        <label className="field">
          <span>Email</span>
          <input
            onChange={(event) => updateField('email', event.target.value)}
            type="email"
            value={formState.email}
          />
        </label>

        <label className="field">
          <span>Telefone</span>
          <input
            onChange={(event) => updateField('telefone', event.target.value)}
            value={formState.telefone}
          />
        </label>

        <label className="field">
          <span>Documento principal</span>
          <input
            onChange={(event) => updateField('documento', event.target.value)}
            value={formState.documento}
          />
        </label>

        <label className="field">
          <span>Empresa (opcional)</span>
          <input
            onChange={(event) => updateField('empresa', event.target.value)}
            value={formState.empresa}
          />
        </label>
      </div>

      <label className="field">
        <span>Endereco</span>
        <textarea
          onChange={(event) => updateField('endereco', event.target.value)}
          rows={3}
          value={formState.endereco}
        />
      </label>

      <section className="form-section">
        <div className="section-heading">
          <div>
            <span className="page-kicker">Acompanhantes</span>
            <p className="muted-copy">
              O backend aceita acompanhante menor sem documento, mas exige documento para maior de idade.
            </p>
          </div>

          <button className="ghost-button compact-button" onClick={addAcompanhante} type="button">
            Adicionar acompanhante
          </button>
        </div>

        {formState.acompanhantes.length === 0 ? (
          <p className="muted-copy">
            Nenhum acompanhante vinculado ainda. O cadastro principal pode ser salvo sem acompanhantes.
          </p>
        ) : null}

        <div className="acompanhantes-stack">
          {formState.acompanhantes.map((acompanhante, index) => (
            <article className="acompanhante-card" key={acompanhante.id || `novo-${index}`}>
              <div className="section-heading">
                <strong>Acompanhante {index + 1}</strong>
                <button
                  className="ghost-button compact-button"
                  onClick={() => removeAcompanhante(index)}
                  type="button"
                >
                  Remover
                </button>
              </div>

              <div className="form-grid form-grid-two-columns">
                <label className="field">
                  <span>Nome completo</span>
                  <input
                    onChange={(event) =>
                      updateAcompanhante(index, {
                        nomeCompleto: event.target.value,
                      })
                    }
                    value={acompanhante.nomeCompleto}
                  />
                </label>

                <label className="field">
                  <span>Documento</span>
                  <input
                    onChange={(event) =>
                      updateAcompanhante(index, {
                        documento: event.target.value,
                      })
                    }
                    placeholder={
                      acompanhante.menorDeIdade
                        ? 'Opcional para menor de idade'
                        : 'Obrigatorio para maior de idade'
                    }
                    value={acompanhante.documento}
                  />
                </label>
              </div>

              <label className="field-checkbox">
                <input
                  checked={acompanhante.menorDeIdade}
                  onChange={(event) =>
                    updateAcompanhante(index, {
                      menorDeIdade: event.target.checked,
                    })
                  }
                  type="checkbox"
                />
                <span>Menor de idade</span>
              </label>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

function formatCpfInput(value: string) {
  return value
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
}
