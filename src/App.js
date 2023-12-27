//import React, { useState, useRef, useEffect, useMemo, useCallback} from 'react';
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
//import { render } from 'react-dom';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import './App.css';

//import 'ag-grid-community/dist/styles/ag-grid.css'; // Core grid CSS, always needed
//import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css'; // Optional theme CSS

import 'ag-grid-community/dist/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css'; // Optional theme CSS

function App() {

    const gridRef = useRef();

    const [rowData, setRowData] = useState([]);
    // const [rowData, setRowData] = useState([
    //      { make: "Toyota", model: "Celica", price: 35000 },
    //      { make: "Ford", model: "Mondeo", price: 32000 },
    //      { make: "Porsche", model: "Boxster", price: 72000, hours: 10 },
    //    ]);

       // Each Column Definition results in one Column.
    const [columnDefs, setColumnDefs] = useState([
         { field: "make" },
         { field: "model" },
         { field: "price"},
         { field: "hours", editable: true },
    ]);

    const defaultColDef = useMemo( () => ({
        sortable: true,
        filter: true,
    }), []);

    const cellClickedListener = useCallback(e => {
        console.log('cellClicked', e);
    });



    useEffect(() => {
        fetch('https://www.ag-grid.com/example-assets/row-data.json')
            .then((result) => result.json())
            .then((rowData) => setRowData(rowData));
    }, []);

    const pushMeClicked = useCallback(e => {
        gridRef.current.api.deselectAll();
    })

 return (




     <div className='ag-theme-alpine-dark' style={{width: 1000, height: 900}}>
        <button onClick={pushMeClicked}>Push Me</button>
         <AgGridReact
            ref={gridRef}
            onCellClicked={cellClickedListener}

            rowData={rowData} // Row Data for Rows

            columnDefs={columnDefs} // Column Defs for Columns

            defaultColDef={defaultColDef} // Default Col Defs for Columns
            rowSelection='multiple' // Allows Multiple Rows to be Selected
            animateRows={true} // Animates Rows when Data Changes

           />
     </div>

 );
};

export default App;
