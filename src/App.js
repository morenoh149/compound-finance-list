import React from 'react';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      fetching: false,
      accounts: [],
      total: 0,
      currentPage: 0,
      totalPages: 0,
      minBorrowed: 0,
      filterColumn: 'total_borrow_value_in_eth'
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
  }

  componentDidMount() {
    this.loadPage();
  }

  /*
   * loadPage calls the Compound api and display the next page of
   * at risk acccounts
   */
  loadPage = () => {
    /* curl command to emulate
    curl -s -X POST https://api.compound.finance/api/v2/account -d '{"max_health":{"value":"1.0"}}' | jq '.pagination_summary'
    {
      "page_number": 1,
      "page_size": 10,
      "total_entries": 834,
      "total_pages": 84
    }
    */
    this.setState({
      fetching: true
    })
    const requestBody = {
      "max_health": {
        "value": "1.0"
      },
      "page_number": this.state.currentPage + 1,
      "page_size": 100
    };
    fetch('https://api.compound.finance/api/v2/account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }).then(res => res.json())
    .then(result => {
      this.setState({
        isLoaded: true,
        fetching: false,
        accounts: this.state.accounts.concat(result.accounts),
        total: result.pagination_summary.total_entries,
        currentPage: result.pagination_summary.page_number,
        totalPages: result.pagination_summary.total_pages
      });
    },
    error => {
      this.setState({
        isLoaded: true,
        fetchin: false,
        error
      });
    })
  }

  handleChange(event) {
    this.setState({minBorrowed: event.target.value});
  }
  handleSelectChange(event) {
    this.setState({filterColumn: event.target.value});
  }

  render() {
    const {
      error,
      isLoaded,
      fetching, accounts, total, currentPage,
      totalPages, minBorrowed, filterColumn
    } = this.state;

    let accountsToRender = accounts.filter(account => account[filterColumn].value >= minBorrowed);

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
      <div className="App">
        <p>
          Compound list of accounts at risk of liquidation
        </p>
        <p>total: {total}</p>
        Filter accounts by amount 
        <select value={filterColumn} onChange={this.handleSelectChange}>
          <option value="total_collateral_value_in_eth">Collateral</option>
          <option value="total_borrow_value_in_eth">Borrowed</option>
        </select>
        :
        <input type="number" min="0" step="0.01" value={minBorrowed} onChange={this.handleChange}/>
        <table>
          <thead>
            <tr>
              <th>Address</th>
              <th>Amount of Collateral</th>
              <th>Amount Borrowed</th>
            </tr>
          </thead>
          <tbody>
            {accountsToRender.map(account => <Account account={account} />)}
          </tbody>
        </table>
        {fetching
        ? <button>Loading Page {currentPage+1}...</button>
        : currentPage < totalPages
          ? <button onClick={this.loadPage}>Next Page</button>
          : <div className="end-list">End of list</div>
        }
      </div>
    );
    }
  }
}

/*
 * Account is a stateless react component displaying one ethereum
 * account
 */
function Account({ account }) {
  return <tr>
    <td>{account.address}</td>
    <td>{account.total_collateral_value_in_eth.value}</td>
    <td>{account.total_borrow_value_in_eth.value}</td>
  </tr>;
}

export default App;
