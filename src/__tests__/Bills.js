/**
 * @jest-environment jsdom
 */


import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import "@testing-library/jest-dom";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";
import router from "../app/Router.js";

  // Permet de réaliser un module de simulation ( i.e : jest.fn())
jest.mock("../app/store", () => mockStore)



describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

      // Vérifie si l'icone est surligné

    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      // On vérifie si windowIcon à bien la class (utilisation jest-dom)
      expect(windowIcon).toHaveClass("active-icon")
    })

      // Vérifie si le trie des dates se fait de façon dévroissant
    test("Then bills should be ordered from earliest to latest", () => {
      // Modification du test pour prendre en compte le rangement des "bills" comme dans la vue (container/bills.js : sort)
      document.body.innerHTML = BillsUI({ data: bills.sort((a, b) => (a.date < b.date) ? 1 : -1) })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

    // Vérifie si le formulaire de saisie d"une nouvelle note de frais apparait

    /**
     * 
     */

  describe("Button for bills Unite Test Suites", () => {
    it("Should redirect me on the new build page", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))
      const billInstance = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      document.body.innerHTML = BillsUI({ data: bills })
      const handleClickNewBill = jest.fn(() => {
        return billInstance.handleClickNewBill()
      })
      const btnNewBill = screen.getByTestId("btn-new-bill")
      btnNewBill.addEventListener("click", handleClickNewBill)
      userEvent.click(btnNewBill)
        // Vérifie que l'évènement est bien appelé
      expect(handleClickNewBill).toHaveBeenCalled()
      await waitFor(() => screen.getByTestId("form-new-bill"))
        // On vérifie que la page d'une nouvelle note de frais apparait avec l'apparition du nouvel ID donc a true
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()
    })
  })

  //Vérifie si un employé voit une modale "yeux" pour consulté l'image de la note de frais

  /**
   * 
   */

  describe("Button for the bill's Image Test Suites", () => {
    it("Should show us the bill's image modal when I click on the button", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const billInstance = new Bills({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })

      document.body.innerHTML = BillsUI({ data: bills })

      const handleClickIconEye = jest.fn((icon) => {
        return billInstance.handleClickIconEye(icon)
      })
      const iconEye = screen.getAllByTestId('icon-eye');
      const modale = document.getElementById("modaleFile")

      $.fn.modal = jest.fn(() => modale.classList.add("show")) // Mock de la modale de bootstrap

      iconEye.forEach((icon) => {
        icon.addEventListener("click", handleClickIconEye(icon))
        userEvent.click(icon)
        expect(handleClickIconEye).toHaveBeenCalled()
      })
      expect(modale).toHaveClass("show")
    })
  })

  // Test fonctionnel

  /**
   * 
   */

  describe("When I navigate to Bills", () => {
    // Vérifie que la page est bien chargé
    test("Then the page show", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))
      new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })    
      document.body.innerHTML = BillsUI({ data: bills })
      await waitFor(() => screen.getByText("Mes notes de frais"))
      expect(screen.getByText("Mes notes de frais")).toBeTruthy()
    })
  })


  // Intégration
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          "localStorage",
          { value: localStorageMock }
      )
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee",
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    // Vérifie si l'erreur 404 s'affiche bien
    test("Then fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
  // Vérifie si l'erreur 500 s'affiche bien
    test("Then fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})