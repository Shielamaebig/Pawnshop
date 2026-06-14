import { expect, test } from '@playwright/test'

test('calculates, validates, and manages an in-memory transaction', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Pawnshop Lending Prototype' })).toBeVisible()
  await expect(page.getByTestId('total-loans')).toHaveText('₱81,000.00')
  await expect(page.getByTestId('total-interest')).toHaveText('₱4,565.00')
  await expect(page.getByTestId('total-earnings')).toHaveText('₱6,215.00')
  await expect(page.getByTestId('total-transactions')).toHaveText('4')

  await page.getByLabel('Loan Term *').selectOption('90')
  await expect(page.getByTestId('preview-interest')).toHaveText('₱1,800.00')
  await expect(page.getByTestId('preview-payable')).toHaveText('₱22,100.00')
  await expect(page.getByTestId('preview-earning')).toHaveText('₱2,100.00')

  await page.getByTestId('add-transaction').click()
  await expect(page.getByRole('alert')).toContainText('Please review')
  await expect(page.getByText('Client name is required.')).toBeVisible()

  await page.getByLabel('Client Name *').fill('Ana Villanueva')
  await page.getByLabel('Contact Number *').fill('0917 555 0182')
  await page.getByLabel('Item Name *').fill('MacBook Air M2')
  await page.getByLabel('Item Category *').selectOption('Gadget')
  await page
    .getByLabel('Item Description *')
    .fill('13-inch laptop, 8 GB RAM, 256 GB storage, charger included.')
  await page.getByLabel('Appraised Value *').fill('40000')
  await page.getByLabel('Loan Amount *').fill('45000')
  await page.getByLabel('Interest Rate *').fill('4')
  await page.getByLabel('Loan Term *').selectOption('60')
  await page.getByLabel('Service Fee *').fill('400')
  await page.getByLabel('Penalty Fee (Optional)').fill('100')
  await page.getByTestId('add-transaction').click()
  await expect(page.getByText('Loan amount cannot exceed the appraised value.')).toBeVisible()

  await page.getByLabel('Loan Amount *').fill('30000')
  await expect(page.getByTestId('preview-interest')).toHaveText('₱2,400.00')
  await expect(page.getByTestId('preview-payable')).toHaveText('₱32,900.00')
  await expect(page.getByTestId('preview-earning')).toHaveText('₱2,900.00')
  await page.getByTestId('add-transaction').click()

  await expect(page.getByTestId('total-transactions')).toHaveText('5')
  await expect(page.getByTestId('total-loans')).toHaveText('₱111,000.00')
  const transactionRow = page.locator('tbody tr').filter({ hasText: 'Ana Villanueva' })
  await expect(transactionRow).toHaveCount(1)
  await expect(transactionRow).toContainText('Active')

  await transactionRow.getByRole('button', { name: "View Ana Villanueva's transaction" }).click()
  await expect(page.getByRole('dialog')).toContainText('MacBook Air M2')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)

  await transactionRow
    .getByRole('button', { name: "Mark Ana Villanueva's transaction as redeemed" })
    .click()
  await expect(transactionRow).toContainText('Redeemed')

  await transactionRow.getByRole('button', { name: "Delete Ana Villanueva's transaction" }).click()
  await transactionRow.getByRole('button', { name: 'Yes' }).click()
  await expect(page.getByTestId('total-transactions')).toHaveText('4')

  await page.reload()
  await expect(page.getByTestId('total-transactions')).toHaveText('4')
  await expect(page.getByText('Ana Villanueva')).toHaveCount(0)
})

test('keeps the dashboard within a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Pawnshop Lending Prototype' })).toBeVisible()
  await expect(page.locator('.summary-card')).toHaveCount(4)
  await expect(page.locator('.table-scroll')).toBeVisible()

  const hasPageOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )
  expect(hasPageOverflow).toBe(false)
})
