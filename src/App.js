import React, {useEffect, useState} from 'react';
import './App.css';

function App() {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filterColumn, setFilterColumn] = useState('total_borrow_value_in_eth');
  const [minBorrowed, setMinBorrowed] = useState(0);

  const loadPage = () => {
    setFetching(true);
    const requestBody = {
      "max_health": {
        "value": "1.0"
      },
      "page_number": currentPage,
      "page_size": 100
    };
    fetch('https://api.compound.finance/api/v2/account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    .then(res => res.json())
    .then(
      (result) => {
        setIsLoaded(true);
        setFetching(false);
        setAccounts(accounts => accounts.concat(result.accounts));
        setTotal(result.pagination_summary.total_entries);
        setTotalPages(result.pagination_summary.total_pages);
      },
      (error) => {
        setIsLoaded(true);
        setFetching(false);
        setError(error);
      }
    )
  };
  useEffect(loadPage, [currentPage]);

  const Filters = () => {
    return (<>
      Filter accounts by amount 
      <select value={filterColumn} onChange={e => setFilterColumn(e.target.value)}>
        <option value="total_collateral_value_in_eth">Collateral</option>
        <option value="total_borrow_value_in_eth">Borrowed</option>
      </select>
      :
      <input
        type="number" min="0" step="0.01" value={minBorrowed}
        onChange={e => {
          console.log('minborrowed', e.target)
          setMinBorrowed(e.target.value)
        }}
      /> 
    </>);
  }

  const LoadMore = () => {
    return fetching
      ? <button>Loading Page {currentPage}...</button>
      : currentPage < totalPages
        ? <button onClick={() => setCurrentPage(currentPage+1)}>Next Page</button>
        : <div className="end-list">End of list</div>
      ;
  }

  const Logo = () => <div>
    <img
      src="./compound.png"
      style={{
        width: '100px',
      }}
    />
  </div>

  if (!isLoaded || fetching) {
    document.documentElement.style.cursor = 'wait';
  } else {
    document.documentElement.style.cursor = 'auto';
  }

  let accountsToRender = accounts.filter(account => account[filterColumn].value >= minBorrowed);

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else {
    return (
      <div className="App">
        <Logo />
        <h1>
          Compound list of accounts at risk of liquidation
        </h1>
        <p>total: {total}</p>
        <Filters />
        <table>
          <thead>
            <tr>
              <th>Count</th>
              <th>Address</th>
              <th>Amount of Collateral</th>
              <th>Amount Borrowed</th>
            </tr>
          </thead>
          <tbody>
            {accountsToRender.map(
              (account, i) => <Account
                account={account}
                count={i+1}
                key={i}
              />
            )}
          </tbody>
        </table>
        <LoadMore />
        <p>total: {total}</p>
      </div>
    );
  }
}

/*
 * Account is a stateless react component displaying one ethereum
 * account
 */
function Account({ account, count }) {
  return (
    <tr>
      <td>{count}</td>
      <td>{account.address}</td>
      <td>{account.total_collateral_value_in_eth.value}</td>
      <td>{account.total_borrow_value_in_eth.value}</td>
    </tr>
  );
}

export default App;
