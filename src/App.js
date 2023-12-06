import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { useTable, useSortBy, useGlobalFilter } from 'react-table';

const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR5F_5-iJaBtonNVe0YCBBfb9hRJMZVgN1fRoDCr6ciUCFDm9Du30oQeRtFP06orVMWSQGpjtitD4IC/pub?output=csv";

function GlobalFilter({ globalFilter, setGlobalFilter }) {
  return (
    <div class="search">
      <div class="search-title">Search</div>
      <div>
        <input
          value={globalFilter || ''}
          onChange={(e) => setGlobalFilter(e.target.value || undefined)}
          placeholder={`Search all fields...`}
          class="search-field"
        /></div>
    </div>
  );
}

function renderCell(key, cell) {
  const value = cell.value;
  key = key.toLowerCase();
  // Simple regex for checking if value is a URL
  if (key.includes("link") || key.includes("profile")) {
    return <a href={value} target="_blank" rel="noopener noreferrer">Go by link</a>;
  }
  return value;
}

function App() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    Papa.parse(url, {
      download: true,
      header: true,
      complete: (results) => {
        setData(results.data.reverse());
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
      <div class="intro">
        <div>
          <p>Recently, more and more people have been turning to me for help in finding a job. Unfortunately, helping everyone individually is an extremely inefficient process. That's why I created this page for the recruiters I communicate with, to save both their time and mine, as well as to provide a complete list of all candidates at once.</p>
          <p>The page is generated automatically based on the requests made to me.</p>
          <p>To add yourself in the list, please connect with me on <a href="https://www.linkedin.com/in/creotiv/" target="_blank" rel="noopener noreferrer">Linkedin</a> and i will send you the link to the form.</p>
          <p><strong>If this project helped you in any way please <a href="https://uah.fund/donate">Donate</a> to help homeless animals of Ukraine</strong></p>
        </div>
        <div class="intro-link"><a href={url}>Download full list here</a></div>
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
                    <span className="label">{cell.column.render('Header')}:</span> {cell.render('Cell')}
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
