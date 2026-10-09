import { expect, test } from '@playwright/test'

test.describe('Controle de Gastos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./')
  })

  test('lança gastos, mostra o resumo e filtra por categoria', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Controle de Gastos' })).toBeVisible()

    await page.getByLabel('Descrição').fill('Mercado')
    await page.getByLabel('Valor (R$)').fill('150,00')
    await page.getByRole('button', { name: 'Adicionar' }).click()

    await page.getByLabel('Descrição').fill('Uber')
    await page.getByLabel('Valor (R$)').fill('32,50')
    await page.getByLabel('Categoria', { exact: true }).selectOption('Transporte')
    await page.getByRole('button', { name: 'Adicionar' }).click()

    await expect(page.getByLabel('Total gasto')).toHaveText('R$ 182,50')
    const resumo = page.getByRole('region', { name: 'Resumo por categoria' })
    await expect(resumo).toContainText('Alimentação')
    await expect(resumo).toContainText('Transporte')

    await page.getByLabel('Mostrar').selectOption('Transporte')
    const lista = page.getByRole('region', { name: 'Gastos' }).getByRole('listitem')
    await expect(lista).toHaveCount(1)
    await expect(lista.first()).toContainText('Uber')
  })

  test('avisa quando o valor está errado', async ({ page }) => {
    await page.getByLabel('Descrição').fill('Cinema')
    await page.getByLabel('Valor (R$)').fill('dez reais')
    await page.getByRole('button', { name: 'Adicionar' }).click()

    await expect(page.getByRole('alert')).toContainText('Valor inválido')
    await expect(page.getByText('Nenhum gasto por aqui ainda.')).toBeVisible()
  })

  test('os gastos continuam lá depois de recarregar a página', async ({ page }) => {
    await page.getByLabel('Descrição').fill('Aluguel')
    await page.getByLabel('Valor (R$)').fill('1.200,00')
    await page.getByLabel('Categoria', { exact: true }).selectOption('Moradia')
    await page.getByRole('button', { name: 'Adicionar' }).click()

    await page.reload()
    await expect(page.getByText('Aluguel')).toBeVisible()
    await expect(page.getByLabel('Total gasto')).toHaveText('R$ 1.200,00')

    await page.getByRole('button', { name: 'Remover Aluguel' }).click()
    await expect(page.getByText('Nenhum gasto por aqui ainda.')).toBeVisible()
  })
})
