import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Box, Button, FormControl, FormHelperText, InputLabel, MenuItem, OutlinedInput, Select,  SelectChangeEvent ,  TextField, Typography } from '@mui/material';
//import axios from 'axios';
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
    const [documents, setDocuments] = useState(null);
    const [fundWalletUI, setFundWalletUI] = useState(false);
    const [currentWallet, setCurrentWallet] = useState(null);
    const [sendCoinUI, setSendCoinUI] = useState(false);

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


    const fetchData = async () => {

        try {
            const response = await fetch('http://127.0.0.1:8000/base/get_data/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            console.log('response', data);
            setDocuments(data);
        } catch (error) {
            console.log("ERROR", error);
        }
    }

    useEffect(() => {

        fetchData();

    }, []);



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

    const getWallets = async (refreshData = false) => {
        console.log("in getWallets - walletNames", walletNames);

        const updateData = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/base/get_wallets/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const data = await response.json();
                console.log("data", data)
                console.log('data.wallet_names', data.wallet_names);
                setWalletNames(data.wallet_names)
                //update local documents
                fetchData();
                //console.log("response: ", data.message);
                console.log("Documents stored", documents )
            } catch (error) {
                console.error('Error getting wallets', error);
            }
        }

        if (refreshData) {
            console.log("refreshData", refreshData);
            updateData();
        }
        let localWalletNames = [];
        if (documents && !refreshData) {
            for (let x = 0; x < documents.length; x++) {
                console.log(documents[x])
                localWalletNames.push(documents[x].name);
            }
            console.log(localWalletNames);
            setWalletNames(localWalletNames);
        }
        if (!localWalletNames) {
            updateData();
        }

    }

    const sendCoin = async (walletName, amount, toWallet) => {
        console.log("in sendCoin", walletName, amount, toWallet);

        let amountToFund = amount;
        let walletName_amount_toWallet = walletName + '_' + amountToFund + '_' + toWallet;
        console.log(walletName_amount_toWallet);

        try {
            const response = await fetch('http://127.0.0.1:8000/base/send_money/?walletName_amount_toWallet='+ walletName_amount_toWallet, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            console.log('data', data);
        } catch (error) {
            console.error('Error getting wallets', error);
        }
    }


    const SendCoinUserInput = () => {
        let tempAmount = "";
        let toWallet = "";

        const getInput = (e) => {
            tempAmount = e.target.value;
        }
        const handleChange = (e) => {
            console.log(e.target.value);
            toWallet = e.target.value;
        }
        let walletList = ["Select"];
        const getWalletList = () => {
            for (let x = 0; x < walletNames.length; x++) {
                if (walletNames[x] !== currentWallet) {
                    walletList.push(walletNames[x]);
                }
            }
        }
        getWalletList();
        console.log(walletList);
        return (
            <div>
                <p>Choose destination wallet</p>
                <div sx={{ m: 1, minWidth: 220 }}>
                    {/* <InputLabel id="demo-simple-select-helper-label">Wallet</InputLabel> */}
                    <div
                    //labelId="demo-simple-select-helper-label"
                    id="demo-simple-select-helper"
                    value={walletList}
                    label="Wallet"
                    onChange={handleChange}
                    >
                    <select name='selectWallet'
                        style={{
                            width: '200px',
                            height: '39px',
                            borderRadius: "3%",
                            backgroundColor: 'inherit',
                            borderColor: '#84b2c1',
                            borderWidth: '1px'
                        }}
                    >

                    {walletList.map((wallet, index) => (
                        <option value={wallet} key={index}>{wallet}</option>
                    ))}
                    </select>

                    </div>

                </div>


                <p>Enter Amount to send</p>
                <p>Enter numbers only</p>
                <TextField
                    sx={{
                        //height: "19px"
                    }}
                    id="outlined-basic"
                    label="Amount"
                    variant="outlined"
                    name="fundAmount"
                    onChange={getInput}
                />

                <Button type="submit"
                    onClick={e => {
                        sendCoin(currentWallet, tempAmount, toWallet)
                        setSendCoinUI(false)
                        getWalletDetails(currentWallet)
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
            </div>
        )


    }


    const SendCoin = () => {


        if (sendCoinUI) {

            return (
                <div>
                <h2>
                    Send Coin
                </h2>

                <SendCoinUserInput />
                <Button
                    onClick={e => {
                        setSendCoinUI(false)
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


    const fundWallet = async (walletName, amount) => {
        console.log("in fundWallet");


        let amountToFund = amount;
        let walletName_amount = walletName + '_' + amountToFund;
        console.log(walletName_amount);

        try {
            const response = await fetch('http://127.0.0.1:8000/base/fund_wallet/?walletName_amount='+ walletName_amount, {
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
            //setCurrentWallet(walletName);
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


    const FundUserInput = (walletName) => {
        let tempAmount = "";

        const getInput = (e) => {
            tempAmount = e.target.value;
        }

        return (
            <form>


                <p>Enter Amount to fund</p>
                <p>Enter numbers only</p>
                <TextField
                    sx={{
                        //height: "19px"
                    }}
                    id="outlined-basic"
                    label="Amount"
                    variant="outlined"
                    name="fundAmount"
                    onChange={getInput}
                />

                <Button type="submit"
                    onClick={e => {
                        fundWallet(currentWallet, tempAmount)
                        setFundWalletUI(false)
                        getWalletDetails(currentWallet)
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


    const FundWallet = () => {
        if (fundWalletUI) {

            return (
                <div>
                <h2>
                    Fund Wallet
                </h2>

                <FundUserInput />
                <Button
                    onClick={e => {
                        setFundWalletUI(false)
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


    const WalletDetails = () => {
        if (walletDetails) {
            console.log("wallet details", walletDetails)
            let walletName = walletDetails.wallet.name
            return (
                <div>
                    <h2>Wallet Details - {walletDetails.wallet.name} <RefreshWalletDetails /></h2>
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
                            setFundWalletUI(true)
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
                        onClick={e => {
                            setSendCoinUI(true)
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
                            setCurrentWallet(null)
                            setSendCoinUI(false)
                            setFundWalletUI(false)
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

        // const handleInputChange = (e) => {
        //     //setNewWalletName(e.target.value);
        //     console.log(e.target.value)
        // };

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


    const RefreshWalletDetails = () => {

        return (
            <Button
                onClick={e => {
                    getWalletDetails(currentWallet)
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


    const RefreshWallets = () => {
        let refreshData = true
        return (
            <Button
                onClick={e => {
                    setWalletNames(null)
                    getWallets(refreshData)

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
                                getWalletDetails(wallet)
                                setCurrentWallet(wallet)
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
            <FundWallet />
            <SendCoin />
        </div>

 );
};

export default App;
