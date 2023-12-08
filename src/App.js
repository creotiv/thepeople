import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import DOMPurify from 'dompurify';
import { useTable, useSortBy, useGlobalFilter } from 'react-table';

const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR3TICsNkBp13yprTa3sQY1lD3RY-vHdVEZRwFLxEQW5idIvod87_Sp1xeZj50-7rdEAI8ahGvdcXw1/pub?output=csv";

function GlobalFilter({ globalFilter, setGlobalFilter }) {
  return (
    <div className="search">
      <div className="search-title">Search</div>
      <div>
        <input
          value={globalFilter || ''}
          onChange={(e) => setGlobalFilter(e.target.value || undefined)}
          placeholder={`Search all fields...`}
          className="search-field"
        /></div>
    </div>
  );
}

function renderCell(key, cell) {
  let value = cell.value;
  value = DOMPurify.sanitize(value);

  if (value.toLowerCase().includes("javascript:")) {
    value = "";
  }

  key = key.toLowerCase();
  // Simple regex for checking if value is a URL
  if ((key.includes("link") || key.includes("profile")) && value) {
    return <a href={value} target="_blank" rel="noopener noreferrer">Go by link</a>;
  }
  return value;
}

function filterOld(data) {
  // Get the date for one week ago
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Filter the array
  const filteredArray = data.filter(item => {
    // Convert the Timestamp string to a Date object
    const itemDate = new Date(item.Timestamp);
    // Check if the item date is older than one week ago
    return itemDate > oneWeekAgo;
  });

  return filteredArray
}

function App() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    Papa.parse(url, {
      download: true,
      header: true,
      complete: (results) => {
        const data = filterOld(results.data.reverse());
        setData(data);
        console.log(data);
        if (results.data.length > 0) {
          const newColumns = Object.keys(results.data[0])
            .filter(key => key !== 'Timestamp') // Exclude the timestamp column
            .map(key => ({
              Header: key,
              accessor: key,
              Cell: ({ cell }) => renderCell(key, cell)
            }));
          setColumns(newColumns);
        }
      }
    });
  }, []);

  const tableInstance = useTable({ columns, data}, useGlobalFilter, useSortBy);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    preGlobalFilteredRows,
    setGlobalFilter,
    state
  } = tableInstance;

  return (
    <div className='pagebody'>
      <div className="intro">
        <div>
          <p>Recently, an increasing number of people have sought my assistance in job hunting. However, aiding each person individually is highly inefficient. Consequently, I have established this page for both recruiters and candidates with whom I communicate. This initiative aims to conserve time for all parties involved and to offer a comprehensive list of all candidates in a single location.</p>
          <p>The page is automatically generated based on the requests made to me.</p>
          <p>To add yourself in the list, please connect with me on <a href="https://www.linkedin.com/in/creotiv/" target="_blank" rel="noopener noreferrer">Linkedin</a> and i will send you the link to the form.</p>
          <p><strong>By utilizing the data in this list, you agree to send hiring or role acceptance bonuses as donation to the <a href="https://uah.fund/donate">Ukraine Animal Help Fund</a> to help homeless animals</strong></p>
        </div>
        <div className="intro-link"><a href={url}>Download full candidates list here</a></div>
      </div>
      
    
      <GlobalFilter
        preGlobalFilteredRows={preGlobalFilteredRows}
        globalFilter={state.globalFilter}
        setGlobalFilter={setGlobalFilter}
      />
      <div {...getTableProps()} className="table2-8bit">
        <div className="head" >
          {headerGroups.map(headerGroup => (
            <div className="tr" {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <div className="th prevent-select " {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' ⬇️'
                        : ' ⬆️'
                      : ''}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="body" {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <div className="tr" {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <div className="td" {...cell.getCellProps()}>
                    <div><span className="label">{cell.column.render('Header')}:</span> {cell.render('Cell')}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
