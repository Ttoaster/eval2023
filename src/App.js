import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Box, Button, FormControl, FormHelperText, InputLabel, MenuItem, OutlinedInput, Select,  SelectChangeEvent ,  TextField, Typography } from '@mui/material';
import BlockCypherQRCode from './BlockCypherQRCode';

import './App.css';




import { SlRefresh } from "react-icons/sl";

function App() {

    //const gridRef = useRef();

    const [firstLoad, setFirstLoad] = useState(true);
    const [walletNames, setWalletNames] = useState(null);
    const [walletDetails, setWalletDetails] = useState(null);
    const [coin, setCoin] = useState("BlockCypher Testnet (BCY)")
    const [createWallet, setCreateWallet] = useState(false);
    const [newWalletName, setNewWalletName] = useState('');
    const [documents, setDocuments] = useState(null);
    const [fundWalletUI, setFundWalletUI] = useState(false);
    const [currentWallet, setCurrentWallet] = useState(null);
    const [sendCoinUI, setSendCoinUI] = useState(false);
    const [QRCodeUI, setQRCodeUI] = useState(false);
    const [timer, setTimer] = useState(false);
    const [publicAddress, setPublicAddress] = useState(null);
    const [deleteWalletAction, setDeleteWalletAction] = useState(false);
    const [transactionConfirmation, setTransactionConfirmation] = useState(false);
    const [isExpired, setIsExpired] = useState(false);


    const FetchData = async () => {

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
            startTimer();
            setTimer(false);
        } catch (error) {
            console.log("ERROR", error);
        }
    }

    function startTimer() {
        // Set the time delay to 30 minutes (in milliseconds)
        const thirtyMinutes = 30 * 60 * 1000;
        const oneMinute = 3 * 60 * 1000;
        console.log("Time restarted");

        setTimeout(() => {
            console.log("30 minutes have passed!");
            setTimer(true);
        }, thirtyMinutes);
      }



    useEffect(() => {

        const firstFetchData = async () => {

            try {
                const response = await fetch('http://127.0.0.1:8000/base/get_data/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const data = await response.json();

                setDocuments(data);
                startTimer();
                setTimer(false);
            } catch (error) {
                console.log("ERROR", error);
            }
        }

        // get latest data
        firstFetchData();
        // Call the function to start the timer
        startTimer();

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
        console.log("in getWallet balance");
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


        const checkTimestamp = (timestamp) => {
            const currentTimestamp = new Date();
            const storedTimestamp = new Date(timestamp);
            console.log(currentTimestamp, " --- ", storedTimestamp);
            const timeDifference = (currentTimestamp - storedTimestamp) / (1000 * 60); // in minutes
            console.log("timeDifference", timeDifference);
            setIsExpired(timeDifference > 30);
            if (timeDifference > 30) {
                return "Expired"
            } else {
                return "Good"
            }
          };


        const updateData = async () => {
            console.log("******************  fetching latest data from blockcypher")
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
                FetchData();
                startTimer();
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
                if (documents[x].timestamp) {
                    console.log(documents[x].timestamp)
                    let result = checkTimestamp(documents[x].timestamp)
                    console.log("result of timestamp check", result)
                    if (result === "Expired") {
                        updateData();
                    }
                }
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
                <p>Enter integers only</p>
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


    const GetQRCode = () => {

        if (QRCodeUI) {

            return (
                <div>
                    <h3>QR Code</h3>
                    <BlockCypherQRCode publicAddress={publicAddress} />
                    <Button
                    onClick={e => {
                            setQRCodeUI(false)
                            setPublicAddress(null)
                    }}
                    variant='outlined'
                    sx={{
                        color: "#161617",
                        marginLeft: "5px",
                        marginTop: "5px",
                        marginBottom: "2px",
                        height: "19px"
                    }}>
                    Hide
                </Button>
                </div>
            )
        }
    }


    // const get_transaction_result = async () => {
    //     let data = ""
    //     try {
    //         const response = await fetch('http://127.0.0.1:8000/base/get_transaction', {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //         });
    //         data = response;
    //         console.log(data);
    //         setTransactionConfirmation(true);
    //     } catch (error) {
    //         console.error('Error getting transaction', error);
    //         setTransactionConfirmation(false);
    //     }
    //     return data;
    // }

    const GetTransactionConfirmation = () => {

        if (transactionConfirmation) {
            return (
                <div>
                    <p>
                        You have transactions that have not been verified.
                    </p>
                    <p>
                        Please click "Query Transaction" to verify if  your transaction has been confirmed.
                    </p>
                    <Button
                        variant='outlined'
                        sx={{
                            color: "#161617",
                            marginLeft: "5px",
                            marginBottom: "2px",
                            height: "19px"
                        }}
                        onClick={ e => {
                            setFundWalletUI(false)
                            setQRCodeUI(false)
                            setSendCoinUI(false)
                            setDeleteWalletAction(false)
                            setTransactionConfirmation(false)
                            getWalletDetails(currentWallet)
                        }}>
                        Query Transaction
                    </Button>

                </div>
            )

        }
    }


    const isDataCurrent = () => {
        let isCurrent = ""

        if (isExpired) {
            console.log("data is expired", isExpired);
            isCurrent = "Data is expired";
        } else {
            isCurrent = "Data is current";
        }

        return (
            <h4>Data Age: {isCurrent} </h4>
        )
    }


    const WalletDetails = () => {
        if (walletDetails) {
            console.log("wallet details", walletDetails)

            const blockCypherPublicAddress = walletDetails.wallet.addresses[0];
            console.log(blockCypherPublicAddress)
            setPublicAddress(blockCypherPublicAddress)

            if (walletDetails.unconfirmed_n_tx !== 0) {
                setTransactionConfirmation(true);
            } else {
                setTransactionConfirmation(false);
            }



            return (
                <div>
                    <h2>Wallet Details - {walletDetails.wallet.name} <RefreshWalletDetails /></h2>
                    <h4>Coin Type: {coin}</h4>
                    <h4>Balance: {walletDetails.balance}</h4>
                    <h4>Total Received: {walletDetails.total_received}</h4>
                    <h4>Total Sent: {walletDetails.total_sent}</h4>
                    <h4>Unconfirmed Balance: {walletDetails.unconfirmed_balance}</h4>
                    <h4>Unconfirmed Transactions: {walletDetails.unconfirmed_n_tx}</h4>

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
                            setQRCodeUI(false)
                            setSendCoinUI(false)
                            setDeleteWalletAction(false)
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
                            setQRCodeUI(false)
                            setFundWalletUI(false)
                            setDeleteWalletAction(false)
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
                        onClick={e => {
                            setQRCodeUI(true)
                            setSendCoinUI(false)
                            setFundWalletUI(false)
                            setDeleteWalletAction(false)
                        }}>
                        QR Code
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
                        //    deleteWallet(walletName)
                            setQRCodeUI(false)
                            setSendCoinUI(false)
                            setFundWalletUI(false)
                            setDeleteWalletAction(true)

                        }}>
                        Delete Wallet
                    </Button>

                    <Button
                        onClick={e => {
                            setWalletDetails(null)
                            setCurrentWallet(null)
                            setSendCoinUI(false)
                            setFundWalletUI(false)
                            setQRCodeUI(false)
                            setDeleteWalletAction(false)
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
                    {/* <div>

                    <Button
                        onClick={e => {
                            get_transaction_result()
                        }}
                        variant='outlined'
                        sx={{
                            color: "#161617",
                            marginLeft: "5px",
                            marginBottom: "2px",
                            height: "19px"
                        }}>
                        Test Confirmation
                    </Button>
                        </div> */}


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
                            variant="outlined"
                            sx={{
                            color: "#161617",
                            marginLeft: "5px",
                            marginBottom: "2px",
                            height: "39px",
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
                            variant="outlined"
                            sx={{
                            color: "#161617",
                            marginLeft: "5px",
                            marginBottom: "2px",
                            height: "39px",
                            }}
                            onClick={ e => {
                                getWallets()
                                setFirstLoad(false)
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


    const TimeWarning = () => {


        if (timer) {
            return (
                <div>
                    <h3
                        style={{
                            color: "#ec942c"
                        }}
                    >Warning!</h3>
                    <p>Data has not been refreshed for 30 minutes.</p>
                    <p>Please click to refresh data.</p>
                    <Button
                            variant="outlined"
                            sx={{
                            color: "#161617",
                            marginLeft: "5px",
                            marginBottom: "2px",
                            height: "19px",
                            }}
                            onClick={ e => {
                                FetchData()
                                setTimer(false)

                            }}>
                            Refresh Data
                        </Button>
                </div>
            )
        }
    }


    const DeleteWallet = () => {
        if (deleteWalletAction) {
            return (
                <div>
                    <h4>Are you sure you want to delete { currentWallet }?</h4>
                    <h5>This action cannot be undone!</h5>
                        <div>
                        <Button
                            variant="outlined"
                            sx={{
                            color: "#161617",
                            marginLeft: "5px",
                            marginBottom: "2px",
                            height: "39px",
                            }}
                            onClick={ e => {
                                getWallets()
                                setFirstLoad(false)
                                deleteWallet(currentWallet)
                                setDeleteWalletAction(false)
                                Wallets()
                            }}>
                            Delete
                        </Button>
                    </div>
                    <div>
                        <Button
                            variant="outlined"
                            sx={{
                            color: "#161617",
                            marginLeft: "5px",
                            marginBottom: "2px",
                            height: "19px",
                            }}
                            onClick={ e => {
                                getWallets()
                                setDeleteWalletAction(false)
                                Wallets()
                            }}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )

        }
    }




    return (


        <div className="App">
            <Title />
            <Menu />
            <TimeWarning />
            <Wallets />
            <WalletDetails />
            <CreateWallet />
            <FundWallet />
            <SendCoin />
            <GetQRCode />
            <DeleteWallet />
            <GetTransactionConfirmation />
        </div>

 );
};

export default App;
