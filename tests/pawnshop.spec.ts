import { expect, test } from '@playwright/test'

test('calculates, validates, and manages an in-memory transaction', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Pawnshop Lending Prototype' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Dashboard' })).toHaveClass(/view-tab--active/)
  await expect(page.getByRole('button', { name: 'Income Statement' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Loan Details' })).toBeVisible()
  await expect(page.getByLabel('Item Category *')).toContainText('Vehicle Lending')
  await expect(page.getByTestId('total-loans')).toHaveText('₱81,000.00')
  await expect(page.getByTestId('total-interest')).toHaveText('₱9,100.00')
  await expect(page.getByTestId('total-earnings')).toHaveText('₱10,650.00')
  await expect(page.getByTestId('total-transactions')).toHaveText('4')

  await page.getByRole('button', { name: 'Loan Details' }).click()
  await expect(page.getByRole('heading', { name: 'Loan Details' })).toBeVisible()
  await expect(page.getByLabel('Monthly Interest Rate')).toHaveValue('7')
  await expect(page.getByLabel('Service Charge Rate')).toHaveValue('1')
  await expect(page.getByLabel('Vehicle Storage Rate')).toHaveValue('2')
  await expect(page.getByLabel('Daily Penalty Rate')).toHaveValue('0.5')
  await page.getByLabel('Monthly Interest Rate').fill('8')
  await page.getByLabel('Service Charge Rate').fill('2')

  await page.getByRole('button', { name: 'Dashboard' }).click()
  await expect(page.getByTestId('preview-interest')).toHaveText('₱1,600.00')
  await expect(page.getByTestId('preview-payable')).toHaveText('₱22,000.00')
  await expect(page.getByTestId('preview-earning')).toHaveText('₱2,000.00')

  await page.getByRole('button', { name: 'Loan Details' }).click()
  await page.getByLabel('Monthly Interest Rate').fill('7')
  await page.getByLabel('Service Charge Rate').fill('1')
  await page.getByRole('button', { name: 'Dashboard' }).click()

  await page.getByLabel('Loan Term *').selectOption('90')
  await expect(page.getByTestId('preview-interest')).toHaveText('₱4,200.00')
  await expect(page.getByTestId('preview-payable')).toHaveText('₱24,400.00')
  await expect(page.getByTestId('preview-earning')).toHaveText('₱4,400.00')

  await page.getByLabel('Item Category *').selectOption('Vehicle')
  await expect(page.getByLabel('Vehicle Year *')).toBeVisible()
  await expect(page.getByLabel('Vehicle Brand *')).toBeVisible()
  await expect(page.getByLabel('Vehicle Model *')).toBeVisible()
  await expect(page.getByLabel('Plate Number (Optional)')).toBeVisible()
  await expect(page.getByTestId('preview-storage-fee')).toHaveText('2% · ₱400.00')
  await expect(page.getByTestId('preview-payable')).toHaveText('₱24,800.00')
  await expect(page.getByTestId('preview-earning')).toHaveText('₱4,800.00')

  await page.getByTestId('add-transaction').click()
  await expect(page.getByRole('alert')).toContainText('Please review')
  await expect(page.getByText('Client name is required.')).toBeVisible()
  await expect(page.getByText('Vehicle brand is required.')).toBeVisible()

  await page.getByLabel('Client Name *').fill('Ana Villanueva')
  await page.getByLabel('Contact Number *').fill('0917 555 0182')
  await page.getByLabel('Item Name *').fill('MacBook Air M2')
  await page.getByLabel('Item Category *').selectOption('Gadget')
  await expect(page.getByTestId('preview-storage-fee')).toHaveCount(0)
  await expect(page.getByLabel('Vehicle Brand *')).toHaveCount(0)
  await page
    .getByLabel('Item Description *')
    .fill('13-inch laptop, 8 GB RAM, 256 GB storage, charger included.')
  await page.getByLabel('Appraised Value *').fill('40000')
  await page.getByLabel('Loan Amount *').fill('45000')
  await page.getByLabel('Loan Term *').selectOption('60')
  await page.getByTestId('add-transaction').click()
  await expect(page.getByText('Loan amount cannot exceed the appraised value.')).toBeVisible()

  await page.getByLabel('Loan Amount *').fill('30000')
  await expect(page.getByTestId('preview-interest')).toHaveText('₱4,200.00')
  await expect(page.getByTestId('preview-payable')).toHaveText('₱34,500.00')
  await expect(page.getByTestId('preview-earning')).toHaveText('₱4,500.00')
  await page.getByTestId('add-transaction').click()

  await expect(page.getByTestId('total-transactions')).toHaveText('5')
  await expect(page.getByTestId('total-loans')).toHaveText('₱111,000.00')
  await expect(page.getByTestId('total-interest')).toHaveText('₱13,300.00')
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

  await page.getByRole('button', { name: 'Income Statement' }).click()
  await expect(page.getByRole('heading', { name: 'Income Statement' })).toBeVisible()
  await expect(page.locator('tbody tr')).toHaveCount(5)
  await expect(page.locator('tbody tr').filter({ hasText: 'Honda Click 125i' })).toContainText(
    '2% · ₱640.00',
  )
  await expect(page.locator('tbody tr').filter({ hasText: 'Honda Click 125i' })).toContainText(
    '1% · ₱320.00',
  )
  await expect(page.locator('tbody tr').filter({ hasText: 'Samsung Smart TV' })).toContainText(
    '0.5%/day · ₱50.00/day × 2 days',
  )
  await expect(page.locator('tfoot')).toContainText('₱13,300.00')

  await page.getByRole('button', { name: 'Dashboard' }).click()
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
  await page.getByRole('button', { name: 'Income Statement' }).click()
  await expect(page.getByRole('heading', { name: 'Income Statement' })).toBeVisible()
  await page.getByRole('button', { name: 'Loan Details' }).click()
  await expect(page.getByRole('heading', { name: 'Loan Details' })).toBeVisible()

  const hasPageOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )
  expect(hasPageOverflow).toBe(false)
})
