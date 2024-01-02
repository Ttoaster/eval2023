import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
//import { render } from 'react-dom';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import './App.css';


import 'ag-grid-community/dist/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css'; // Optional theme CSS

import { SlRefresh } from "react-icons/sl";

function App() {

    const gridRef = useRef();

    const [firstLoad, setFirsLoad] = useState(true);
    const [walletNames, setWalletNames] = useState(null);
    const [walletDetails, setWalletDetails] = useState(null);
    const [coin, setCoin] = useState("BlockCypher Testnet (BCY)")
    const [createWallet, setCreateWallet] = useState(false);
    const [newWalletName, setNewWalletName] = useState('');

       // Each Column Definition results in one Column.
    const [columnDefs, setColumnDefs] = useState([
        { field: "make" },
        { field: "model" },
        { field: "price"},
        { field: "hours", editable: true },
        { field: "email"}
    ]);

    const defaultColDef = useMemo( () => ({
        sortable: true,
        filter: true,
    }), []);

    const cellClickedListener = useCallback(e => {
        console.log('cellClicked', e);
    });



    useEffect(() => {
        // fetch('https://www.ag-grid.com/example-assets/row-data.json')
        //     .then((result) => result.json())
        //     .then((rowData) => setRowData(rowData));
    }, []);

    // const pushMeClicked = useCallback(e => {
    //     gridRef.current.api.deselectAll();
    // })

    const createNewWallet = async (newWallet) => {
        console.log("Test transaction clicked newWalletName", newWalletName);
        console.log('newWallet tempName', newWallet);
        try {
            const response = await fetch('http://127.0.0.1:8000/base/create_wallet/?newWalletName=' + newWallet, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();

            console.log("response: ", data.message);
            console.log("block height", data.records);
            setNewWalletName(null);
        } catch (error) {
            console.error('Error creating wallet', error);
        }

    }

    const getWalletBalance = async () => {
        console.log("in getWallets");
        try {
            const response = await fetch('http://127.0.0.1:8000/base/get_balance/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            console.log('data', data);
            //console.log("response: ", data.message);
            //console.log("block height", data.records )
        } catch (error) {
            console.error('Error getting wallets', error);
        }
    }

    const getWallets = async () => {
        console.log("in getWallets - walletNames", walletNames);

        try {
            const response = await fetch('http://127.0.0.1:8000/base/get_wallets/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            console.log('data', data.wallet_names);
            setWalletNames(data.wallet_names)
            //console.log("response: ", data.message);
            //console.log("block height", data.records )
        } catch (error) {
            console.error('Error getting wallets', error);
        }
    }

    const sendCoin = async () => {
        console.log("in sendCoin");
        try {
            const response = await fetch('http://127.0.0.1:8000/base/send_money/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            console.log('data', data);
            //console.log("response: ", data.message);
            //console.log("block height", data.records )
        } catch (error) {
            console.error('Error getting wallets', error);
        }
    }


    const fundWallet = async () => {
        console.log("in fundWallet");
        try {
            const response = await fetch('http://127.0.0.1:8000/base/fund_wallet/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            console.log('data', data);
        } catch (error) {
            console.error('Error funding wallet', error);
        }
    }


    const getWalletDetails = async (walletName) => {
        console.log("in getWalletDetails", walletName)
        try {
            const response = await fetch('http://127.0.0.1:8000/base/get_wallet_details/?walletName='+ walletName , {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            console.log('data', data);
            setWalletDetails(data);
        } catch (error) {
            console.error('Error funding wallet', error);
        }
    }


    const deleteWallet = async (walletName) => {
        console.log("in delete wallet", walletName)
        try {
            const response = await fetch('http://127.0.0.1:8000/base/delete_user_wallet/?walletNameToDelete='+ walletName , {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            setWalletDetails(null);
            setWalletNames(null);
            getWallets();
        } catch (error) {
            console.error('Error funding wallet', error);
        }

    }


    const WalletDetails = () => {
        if (walletDetails) {
            console.log("wallet details", walletDetails)
            let walletName = walletDetails.wallet.name
            return (
                <div>
                    <h2>Wallet Details - {walletDetails.wallet.name}</h2>
                    <h4>Coin Type: {coin}</h4>
                    <h4>Balance: {walletDetails.balance}</h4>
                    <h4>Total Received: {walletDetails.total_received}</h4>
                    <h4>Total Sent: {walletDetails.total_sent}</h4>
                    <h4>Unconfirmed Balance: {walletDetails.unconfirmed_balance}</h4>



                    <Button
                        variant='outlined'
                        sx={{
                            color: "#161617",
                            marginLeft: "5px",
                            marginBottom: "2px",
                            height: "19px"
                        }}
                        onClick={ e => {
                            fundWallet()
                        }}>
                        Fund Wallet
                    </Button>


                    <Button
                        variant='outlined'
                        sx={{
                            color: "#161617",
                            marginLeft: "5px",
                            marginBottom: "2px",
                            height: "19px"
                        }}
                        onClick={ e => {
                            sendCoin()
                        }}>
                        Send Coin
                    </Button>

                    <Button
                        variant='outlined'
                        sx={{
                            color: "#161617",
                            marginLeft: "5px",
                            marginBottom: "2px",
                            height: "19px"
                        }}
                        onClick={ e => {
                            deleteWallet(walletName)
                        }}>
                        Delete Wallet
                    </Button>

                    <Button
                        onClick={e => {
                            setWalletDetails(null)
                            Wallets()
                        }}
                        variant='outlined'
                        sx={{
                            color: "#161617",
                            marginLeft: "5px",
                            marginBottom: "2px",
                            height: "19px"
                        }}>
                        Back to Wallets
                    </Button>
                </div>
            )
        }
    }



    const UserInput = () => {
        let tempName = "";

        const getInput = (e) => {
            tempName = e.target.value;
        }

        return (
            <form>

                <p>Enter New Wallet Name</p>
                <TextField
                    sx={{
                        //height: "19px"
                    }}
                    id="outlined-basic"
                    label="Wallet Name"
                    variant="outlined"
                    name="newWalletName"
                    onChange={getInput}
                />

            <Button type="submit"
                onClick={e => {
                    setNewWalletName(tempName)
                    createNewWallet(tempName)
                    setCreateWallet(false)
                    setWalletNames(null)
                    getWallets()
                }}
                variant='outlined'
                sx={{
                    color: "#161617",
                    marginLeft: "5px",
                    marginBottom: "2px",
                    height: "56px"
                }}>
                Submit
            </Button>
        </form>
        )
    }



    const CreateWallet = () => {

        const handleInputChange = (e) => {
            //setNewWalletName(e.target.value);
            console.log(e.target.value)
        };

        if (createWallet) {

            return (
                <div>
                    <h2>
                        Create New Wallet
                    </h2>

                    <UserInput />
                    <Button
                        onClick={e => {
                            setCreateWallet(false)
                            Wallets()

                        }}
                        variant='outlined'
                        sx={{
                            color: "#161617",
                            marginLeft: "5px",
                            marginTop: "5px",
                            marginBottom: "2px",
                            height: "19px"
                        }}>
                        Cancel
                    </Button>
                </div>
            )
        }

    }

    const RefreshWallets = () => {

        return (
            <Button
                onClick={e => {
                    setWalletNames(null)
                    getWallets()

                }}
                variant='outlined'
                sx={{
                    color: "#161617",
                    marginLeft: "5px",
                    marginTop: "5px",
                    marginBottom: "4px",
                    height: "29px",
                    width: "auto"
                }}>
                 <SlRefresh />
            </Button>
        )
    }



    const Wallets = () => {
        if (walletNames && !walletDetails && !createWallet) {
            let walletList = walletNames.sort();
            return (
                <div>
                    <h2
                    style={{
                        color: "black",
                    }}
                    >
                    Current Wallets <RefreshWallets />
                    </h2>
                    {walletList.map((wallet, index) => (
                    <div wallet={wallet} key={index}>
                        <p
                        style={{
                            color: "black",
                        }}
                        >
                        Wallet: {wallet}
                        <Button
                            onClick={(e) => {
                            getWalletDetails(wallet);
                            }}
                            variant="outlined"
                            sx={{
                            color: "#161617",
                            marginLeft: "5px",
                            marginBottom: "2px",
                            height: "19px",
                            }}
                        >
                            Details
                        </Button>
                        </p>
                    </div>
                    ))}

                    <div>
                    <Button
                        variant="contained"
                        sx={{
                        marginBottom: "5px",
                        }}
                        onClick={(e) => {

                            setCreateWallet(true);
                        }}
                    >
                        Create New Wallet
                    </Button>
                    </div>
                </div>
            );
        }
    };

    const Menu = () => {

        if (firstLoad) {

            return (
                <div>
                    <Box>
                        <Typography variant="body1" color="initial">Welcome back!</Typography>
                    <div>
                        <Button
                            variant="contained"
                            sx={{
                                marginBottom: "5px"
                            }}
                            onClick={ e => {
                                getWallets()
                                setFirsLoad(false)
                            }}>
                            View Wallets
                        </Button>
                    </div>
                    </Box>
                </div>
            )
        }
    }

    const Title = () => {

        return (
            <div>
                <h1>Eval2023 App</h1>
            </div>
        )
    }










 return (




     <div className="App">


        <Title />
        <Menu />
         <Wallets />
         <WalletDetails />
        <CreateWallet />







        {/* <button onClick={pushMeClicked}>Push Me</button>*/}
         {/* <AgGridReact
            ref={gridRef}
            onCellClicked={cellClickedListener}

            rowData={rowData} // Row Data for Rows

            columnDefs={columnDefs} // Column Defs for Columns

            defaultColDef={defaultColDef} // Default Col Defs for Columns
            rowSelection='multiple' // Allows Multiple Rows to be Selected
            animateRows={true} // Animates Rows when Data Changes

           /> */}
     </div>

 );
};

export default App;
