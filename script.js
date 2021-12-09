//ADD NEW TRANSACTION TOGGLE
const Modal = {
  open() {
    document.querySelector('.modal-overlay').classList.add('active')
  },
  close() {
    document.querySelector('.modal-overlay').classList.remove('active')
  }
}


const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
  },
  set(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
  }
}

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction)
    App.reload()
  },

  remove(index) {
    Transaction.all.splice(index, 1)
    App.reload()
  },
  incomes() {
    let income = 0
    Transaction.all.forEach(transaction => {
      if (transaction.amount > 0) {
        income += transaction.amount
      }
    })

    return income
  },

  expenses() {
    let expense = 0
    Transaction.all.forEach(transaction => {
      if (transaction.amount < 0) {
        expense += transaction.amount
      }
    })

    return expense
  },

  total() {
    return Transaction.incomes() + Transaction.expenses()
  }
}

const cardTotal = {
  // LOOKING FOR BETTER SOLUTION
  dcard(){
    let dTotal = Transaction.total()
    if(dTotal == 0){
       document.querySelector('.total').classList.add('even')
       document.querySelector('.total').classList.remove('negative')
       document.querySelector('.total').classList.remove('positive')
    }
    if(dTotal < 0){
       document.querySelector('.total').classList.add('negative')
       document.querySelector('.total').classList.remove('even')
       document.querySelector('.total').classList.remove('positive')
    }
    if(dTotal > 0){
       document.querySelector('.total').classList.add('positive')
       document.querySelector('.total').classList.remove('even')
       document.querySelector('.total').classList.remove('negative')
    }
  }
}

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index

    DOM.transactionsContainer.appendChild(tr)
  },
  innerHTMLTransaction(transaction, index) {
    const CSSClass = transaction.amount > 0 ? 'income' : 'expense'

    const amount = utils.formatCurrency(transaction.amount)

    const html = `
    <td class="description">${transaction.description}</td>
    <td class="${CSSClass}">${amount}</td>
    <td class="date">${transaction.date}</td>
    <td>
      <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="remove Transaction" />
    </td>
    `
    return html
  },
  updateBalance() {
    document.getElementById('incomeDisplay').innerHTML = utils.formatCurrency(
      Transaction.incomes()
    )
    document.getElementById('expenseDisplay').innerHTML = utils.formatCurrency(
      Transaction.expenses()
    )
    document.getElementById('totalDisplay').innerHTML = utils.formatCurrency(
      Transaction.total()
    )
  },
  clearTransactions() {
    DOM.transactionsContainer.innerHTML = ''
  }
}

//FORMATING  SETUP
const utils = {
  formatAmount(value) {
    value = Number(value) * 100

    return Math.round(value)
  },
  formatDate(date) {
    const splittedDate = date.split('-')
    return `${splittedDate[1]}/${splittedDate[2]}/${splittedDate[0]}`
  },
  formatCurrency(value) {
    const symbol = Number(value) < 0 ? '-' : ''

    value = String(value).replace(/\D/g, '')

    value = Number(value) / 100

    value = value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    })
    return symbol + value
  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  validateFields() {
    const { description, amount, date } = Form.getValues()

    if (
      description.trim() === '' ||
      amount.trim() === '' ||
      date.trim() === ''
    ) {
      throw new Error('Fill all fields')
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues()
    amount = utils.formatAmount(amount)
    date = utils.formatDate(date)
    return {
      description,
      amount,
      date
    }
  },
  clearFields() {
    Form.description.value = ''
    Form.amount.value = ''
    Form.date.value = ''
  },
  submit(event) {
    event.preventDefault()

    try {
      Form.validateFields()
      const transaction = Form.formatValues()
      Transaction.add(transaction)
      Form.clearFields()
      Modal.close()
    } catch (error) {
      alert(error.message)
    }
  }
}

const App = {
  init() {
    cardTotal.dcard()
    Transaction.all.forEach(DOM.addTransaction)

    DOM.updateBalance()

    Storage.set(Transaction.all)
  },
  reload() {
    DOM.clearTransactions()
    App.init()
  }
}

App.init()
