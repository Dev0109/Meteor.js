export default showBankInfo = () => {
    if (!localStorage.getItem("VS1ReconcileShowBankInfo")) {
        setTimeout(function() {
            swal({
                type: 'info',
                title: 'Fully Automated Bank Integration coming in April 2023',
                input: 'checkbox',
                inputValue: 1,
                inputPlaceholder: '   Do not Show again',
                showCancelButton: false,
                confirmButtonText: 'Ok',
            }).then((result) => {
                // console.log(result)
                if (result && result.value)
                    localStorage.setItem("VS1ReconcileShowBankInfo", true);
            });
        }, 3000);
    }
}