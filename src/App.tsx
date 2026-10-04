import { useEffect, useState } from 'react'
import './App.css'

type Customer = {
  id: string
  name: string
  phone: string
  email: string
  city: string
  createdAt: string
}

type CustomerForm = Omit<Customer, 'id' | 'createdAt'>
type FieldErrors = Partial<Record<keyof CustomerForm, string>>
type IconName = 'search' | 'plus' | 'edit' | 'trash' | 'close' | 'people' | 'city' | 'calendar'

const STORAGE_KEY = 'customer-book.customers'

const emptyForm: CustomerForm = {
  name: '',
  phone: '',
  email: '',
  city: '',
}

function isCustomer(value: unknown): value is Customer {
  if (typeof value !== 'object' || value === null) return false

  const customer = value as Record<string, unknown>
  return ['id', 'name', 'phone', 'email', 'city', 'createdAt'].every(
    (field) => typeof customer[field] === 'string',
  )
}

function loadCustomers(): Customer[] {
  try {
    const savedCustomers = localStorage.getItem(STORAGE_KEY)
    if (!savedCustomers) return []

    const parsedCustomers: unknown = JSON.parse(savedCustomers)
    return Array.isArray(parsedCustomers) ? parsedCustomers.filter(isCustomer) : []
  } catch {
    return []
  }
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const sharedProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  }

  switch (name) {
    case 'search':
      return <svg {...sharedProps}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
    case 'plus':
      return <svg {...sharedProps}><path d="M12 5v14M5 12h14" /></svg>
    case 'edit':
      return <svg {...sharedProps}><path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" /></svg>
    case 'trash':
      return <svg {...sharedProps}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
    case 'close':
      return <svg {...sharedProps}><path d="m18 6-12 12M6 6l12 12" /></svg>
    case 'people':
      return <svg {...sharedProps}><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6M23 11h-6" /></svg>
    case 'city':
      return <svg {...sharedProps}><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 13v.01M9 17v.01M15 13v.01M15 17v.01" /></svg>
    case 'calendar':
      return <svg {...sharedProps}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></svg>
  }
}

function validateCustomer(form: CustomerForm): FieldErrors {
  const errors: FieldErrors = {}
  const phoneDigits = form.phone.replace(/\D/g, '')

  if (!form.name.trim()) errors.name = 'Enter the customer name.'
  if (!form.phone.trim()) {
    errors.phone = 'Enter a phone number.'
  } else if (!/^[+\d\s().-]+$/.test(form.phone) || phoneDigits.length < 7 || phoneDigits.length > 15) {
    errors.phone = 'Use 7-15 digits; +, spaces, and dashes are okay.'
  }
  if (!form.email.trim()) {
    errors.email = 'Enter an email address.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email, such as name@example.com.'
  }
  if (!form.city.trim()) errors.city = 'Enter a city.'

  return errors
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function App() {
  const [customers, setCustomers] = useState<Customer[]>(loadCustomers)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [form, setForm] = useState<CustomerForm>(emptyForm)
  const [errors, setErrors] = useState<FieldErrors>({})

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customers))
    } catch {}
  }, [customers])

  useEffect(() => {
    if (!dialogOpen) return

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') closeDialog()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [dialogOpen])

  const normalizedSearch = search.trim().toLowerCase()
  const visibleCustomers = customers.filter((customer) =>
    [customer.name, customer.phone, customer.email, customer.city]
      .some((value) => value.toLowerCase().includes(normalizedSearch)),
  )
  const citiesCount = new Set(customers.map((customer) => customer.city.trim().toLowerCase())).size

  function openNewDialog() {
    setEditingCustomer(null)
    setForm(emptyForm)
    setErrors({})
    setDialogOpen(true)
  }

  function openEditDialog(customer: Customer) {
    setEditingCustomer(customer)
    setForm({ name: customer.name, phone: customer.phone, email: customer.email, city: customer.city })
    setErrors({})
    setDialogOpen(true)
  }

  function closeDialog() {
    setDialogOpen(false)
    setEditingCustomer(null)
    setErrors({})
  }

  function saveCustomer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationErrors = validateCustomer(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    const savedCustomer: Customer = {
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      city: form.city.trim(),
      id: editingCustomer?.id ?? crypto.randomUUID(),
      createdAt: editingCustomer?.createdAt ?? new Date().toISOString(),
    }

    setCustomers((currentCustomers) =>
      editingCustomer
        ? currentCustomers.map((customer) => customer.id === editingCustomer.id ? savedCustomer : customer)
        : [savedCustomer, ...currentCustomers],
    )
    closeDialog()
  }

  function deleteCustomer(customer: Customer) {
    const confirmed = window.confirm(`Delete ${customer.name} from your customer list?`)
    if (confirmed) {
      setCustomers((currentCustomers) => currentCustomers.filter((item) => item.id !== customer.id))
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#customers" aria-label="Customer Book home">
          <span className="brand-mark"><span /></span>
          <span>kindred<span className="brand-period">.</span></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <button className="nav-item nav-item-active" type="button">
          <Icon name="people" size={19} />
          <span>Customers</span>
          <span className="nav-count">{customers.length}</span>
        </button>
        <div className="sidebar-note">
          <span className="storage-dot" />
          <div><strong>Saved on this device</strong><span>Your list stays in this browser</span></div>
        </div>
        <div className="sidebar-footer">CUSTOMER BOOK <span>·</span> DAY 01</div>
      </aside>

      <main className="main-area" id="customers">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>Customers</strong></div>
          <div className="profile"><span className="profile-dot" /> Local workspace</div>
        </header>

        <div className="content-wrap">
          <div className="page-heading">
            <div>
              <div className="eyebrow">YOUR PEOPLE, IN ONE PLACE</div>
              <h1>Customer directory</h1>
              <p>A clear view of everyone you work with.</p>
            </div>
            <button className="primary-button" type="button" onClick={openNewDialog}>
              <Icon name="plus" size={18} /> Add customer
            </button>
          </div>

          <section className="stats-strip" aria-label="Customer summary">
            <div className="stat-item"><span className="stat-icon stat-icon-green"><Icon name="people" /></span><div><span className="stat-label">TOTAL CUSTOMERS</span><strong>{customers.length}</strong></div></div>
            <div className="stat-item"><span className="stat-icon stat-icon-yellow"><Icon name="city" /></span><div><span className="stat-label">CITIES REACHED</span><strong>{citiesCount}</strong></div></div>
            <div className="stat-item"><span className="stat-icon stat-icon-blue"><Icon name="calendar" /></span><div><span className="stat-label">SHOWING NOW</span><strong>{visibleCustomers.length}</strong></div></div>
            <div className="stats-aside">A little more organized,<br />one person at a time.</div>
          </section>

          <section className="directory-section" aria-labelledby="directory-title">
            <div className="directory-heading">
              <div><h2 id="directory-title">All customers</h2><p>Manage your customer details and keep them up to date.</p></div>
              <span className="result-count">{visibleCustomers.length} {visibleCustomers.length === 1 ? 'record' : 'records'}</span>
            </div>
            <label className="search-field">
              <Icon name="search" size={19} />
              <input
                type="search"
                placeholder="Search name, phone, email, or city..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search customers"
              />
              <kbd>SEARCH</kbd>
            </label>

            {visibleCustomers.length > 0 ? (
              <div className="table-scroll">
                <table>
                  <thead><tr><th>NAME</th><th>PHONE</th><th>EMAIL</th><th>CITY</th><th>ADDED</th><th><span className="visually-hidden">Actions</span></th></tr></thead>
                  <tbody>
                    {visibleCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td data-label="Name"><div className="customer-name"><span className="avatar">{initials(customer.name)}</span><strong>{customer.name}</strong></div></td>
                        <td data-label="Phone">{customer.phone}</td>
                        <td data-label="Email"><a className="email-link" href={`mailto:${customer.email}`}>{customer.email}</a></td>
                        <td data-label="City"><span className="city-label">{customer.city}</span></td>
                        <td data-label="Added" className="date-cell">{new Date(customer.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td data-label="Actions"><div className="row-actions">
                          <button className="icon-button" type="button" title={`Edit ${customer.name}`} aria-label={`Edit ${customer.name}`} onClick={() => openEditDialog(customer)}><Icon name="edit" size={17} /></button>
                          <button className="icon-button delete-button" type="button" title={`Delete ${customer.name}`} aria-label={`Delete ${customer.name}`} onClick={() => deleteCustomer(customer)}><Icon name="trash" size={17} /></button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon"><Icon name={search ? 'search' : 'people'} size={24} /></span>
                <h3>{search ? 'No matching customers' : 'Your customer list starts here'}</h3>
                <p>{search ? 'Try another name, phone number, email, or city.' : 'Add your first customer to keep their details close at hand.'}</p>
                {search ? <button className="text-button" type="button" onClick={() => setSearch('')}>Clear search</button> : <button className="text-button" type="button" onClick={openNewDialog}>Add your first customer</button>}
              </div>
            )}
            <div className="table-footer"><span>Customer details stay in this browser on this device.</span><span>{visibleCustomers.length} OF {customers.length} SHOWN</span></div>
          </section>
          <footer className="page-footer"><span>Made for thoughtful follow-up.</span><span>Customer Book | v1.0</span></footer>
        </div>
      </main>

      {dialogOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog() }}>
          <section className="customer-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
            <div className="dialog-heading">
              <div><span className="eyebrow">CUSTOMER DETAILS</span><h2 id="dialog-title">{editingCustomer ? 'Edit customer' : 'Add a customer'}</h2><p>All fields are required.</p></div>
              <button className="icon-button close-button" type="button" title="Close dialog" aria-label="Close dialog" onClick={closeDialog}><Icon name="close" /></button>
            </div>
            <form onSubmit={saveCustomer} noValidate>
              <label className="form-field" htmlFor="customer-name">Customer name<input id="customer-name" name="name" autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} placeholder="e.g. Jordan Lee" />{errors.name && <span className="field-error" id="name-error">{errors.name}</span>}</label>
              <div className="form-grid">
                <label className="form-field" htmlFor="customer-phone">Phone<input id="customer-phone" name="phone" type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'phone-error' : undefined} placeholder="e.g. +1 555 012 3456" />{errors.phone && <span className="field-error" id="phone-error">{errors.phone}</span>}</label>
                <label className="form-field" htmlFor="customer-email">Email<input id="customer-email" name="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} placeholder="e.g. jordan@example.com" />{errors.email && <span className="field-error" id="email-error">{errors.email}</span>}</label>
              </div>
              <label className="form-field" htmlFor="customer-city">City<input id="customer-city" name="city" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} aria-invalid={Boolean(errors.city)} aria-describedby={errors.city ? 'city-error' : undefined} placeholder="e.g. Seattle" />{errors.city && <span className="field-error" id="city-error">{errors.city}</span>}</label>
              <div className="dialog-actions"><button className="secondary-button" type="button" onClick={closeDialog}>Cancel</button><button className="primary-button" type="submit">{editingCustomer ? 'Save changes' : <><Icon name="plus" size={17} /> Save customer</>}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default App
