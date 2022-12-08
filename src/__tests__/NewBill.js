/**
 * @jest-environment jsdom
 */

 import { fireEvent, screen } from "@testing-library/dom";
 import BillsUI from "../views/BillsUI.js"
 import NewBillUI from "../views/NewBillUI.js";
 import NewBill from "../containers/NewBill.js";
 import mockStore from "../__mocks__/store";
 import { ROUTES, ROUTES_PATH } from "../constants/routes";
 import {localStorageMock} from "../__mocks__/localStorage.js";
 import userEvent from "@testing-library/user-event"
 import router from "../app/Router.js";
 
 jest.mock("../app/store", () => mockStore)
 
 describe("Given I am connected as an employee", () => {
   describe("When I submit a new Bill", () => {
     // Vérifie que la facture se sauvegarde
     it("Then must save the bill", async () => {
       const onNavigate = (pathname) => {
         document.body.innerHTML = ROUTES({ pathname })
       }
   
       Object.defineProperty(window, "localStorage", { value: localStorageMock })
       window.localStorage.setItem("user", JSON.stringify({
         type: "Employee"
       }))
   
       const html = NewBillUI()
       document.body.innerHTML = html
   
       const newBillInit = new NewBill({
         document, onNavigate, store: null, localStorage: window.localStorage
       })
   
       const formNewBill = screen.getByTestId("form-new-bill")
       expect(formNewBill).toBeTruthy()
       
       const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
       formNewBill.addEventListener("submit", handleSubmit);
       fireEvent.submit(formNewBill);
       expect(handleSubmit).toHaveBeenCalled();
     });
 
     test("Then show the new bill page", async () => {
       localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
       const root = document.createElement("div")
       root.setAttribute("id", "root")
       document.body.append(root)
       router()
       window.onNavigate(ROUTES_PATH.NewBill)
     })
 
     // Vérifie si un fichier est bien chargé
     it("Then verify the file bill", async() => {
       jest.spyOn(mockStore, "bills")
 
       const onNavigate = (pathname) => {
         document.body.innerHTML = ROUTES({ pathname })
       }      
 
       Object.defineProperty(window, "localStorage", { value: localStorageMock })
       Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH['NewBill']} })
       window.localStorage.setItem("user", JSON.stringify({
         type: "Employee"
       }))
 
       const html = NewBillUI()
       document.body.innerHTML = html
 
       const newBillInit = new NewBill({
         document, onNavigate, store: mockStore, localStorage: window.localStorage
       })
 
       const file = new File(['image'], 'image.png', {type: 'image/png'});
       const handleChangeFile = jest.fn((e) => newBillInit.handleChangeFile(e));
       const formNewBill = screen.getByTestId("form-new-bill")
       const billFile = screen.getByTestId('file');
 
       billFile.addEventListener("change", handleChangeFile);     
       userEvent.upload(billFile, file)
       
       expect(billFile.files[0].name).toBeDefined()
       expect(handleChangeFile).toBeCalled()
      
       const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
       formNewBill.addEventListener("submit", handleSubmit);     
       fireEvent.submit(formNewBill);
       expect(handleSubmit).toHaveBeenCalled();
     })   
   })

    // test d'intégration POST
  describe("Given I am a user connected as Employee", () => {
    describe("When I add a new bill", () => {
        it("Then it creates a new bill", () => {
          //page NewBill
          document.body.innerHTML = NewBillUI()
              // initialisation champs bills
          const inputData = {
                  type: 'Transports',
                  name: 'Test',
                  datepicker: '2021-05-26',
                  amount: '100',
                  vat: '10',
                  pct: '19',
                  commentary: 'Test',
                  file: new File(['test'], 'test.png', { type: 'image/png' }),
              }
              // récupération éléments de la page
          const formNewBill = screen.getByTestId('form-new-bill')
          const inputExpenseName = screen.getByTestId('expense-name')
          const inputExpenseType = screen.getByTestId('expense-type')
          const inputDatepicker = screen.getByTestId('datepicker')
          const inputAmount = screen.getByTestId('amount')
          const inputVAT = screen.getByTestId('vat')
          const inputPCT = screen.getByTestId('pct')
          const inputCommentary = screen.getByTestId('commentary')
          const inputFile = screen.getByTestId('file')

          // simulation de l'entrée des valeurs
          fireEvent.change(inputExpenseType, {
              target: { value: inputData.type },
          })
          expect(inputExpenseType.value).toBe(inputData.type)

          fireEvent.change(inputExpenseName, {
              target: { value: inputData.name },
          })
          expect(inputExpenseName.value).toBe(inputData.name)

          fireEvent.change(inputDatepicker, {
              target: { value: inputData.datepicker },
          })
          expect(inputDatepicker.value).toBe(inputData.datepicker)

          fireEvent.change(inputAmount, {
              target: { value: inputData.amount },
          })
          expect(inputAmount.value).toBe(inputData.amount)

          fireEvent.change(inputVAT, {
              target: { value: inputData.vat },
          })
          expect(inputVAT.value).toBe(inputData.vat)

          fireEvent.change(inputPCT, {
              target: { value: inputData.pct },
          })
          expect(inputPCT.value).toBe(inputData.pct)

          fireEvent.change(inputCommentary, {
              target: { value: inputData.commentary },
          })
          expect(inputCommentary.value).toBe(inputData.commentary)

          userEvent.upload(inputFile, inputData.file)
          expect(inputFile.files[0]).toStrictEqual(inputData.file)
          expect(inputFile.files).toHaveLength(1)

          // localStorage should be populated with form data
          Object.defineProperty(window, 'localStorage', {
              value: {
                  getItem: jest.fn(() =>
                      JSON.stringify({
                          email: 'email@test.com',
                      })
                  ),
              },
              writable: true,
          })

          // we have to mock navigation to test it
          const onNavigate = (pathname) => {
              document.body.innerHTML = ROUTES({ pathname })
          }

          //initialisation NewBill
          const newBill = new NewBill({
              document,
              onNavigate,
              localStorage: window.localStorage,
          })

          //déclenchement de l'événement
          const handleSubmit = jest.fn(newBill.handleSubmit)
          formNewBill.addEventListener('submit', handleSubmit)
          fireEvent.submit(formNewBill)
          expect(handleSubmit).toHaveBeenCalled()
        })
        it("Then it fails with a 404 message error", async() => {
            const html = BillsUI({ error: 'Erreur 404' })
            document.body.innerHTML = html;
            const message = await screen.getByText(/Erreur 404/);
            expect(message).toBeTruthy();
        })
        it("Then it fails with a 500 message error", async() => {
            const html = BillsUI({ error: 'Erreur 500' })
            document.body.innerHTML = html;
            const message = await screen.getByText(/Erreur 500/);
            expect(message).toBeTruthy();
        })
    })
  })
 })
 