import { useCallback, useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

function Invoices() {
  const { user } = useContext(AuthContext);
  const [invoices, setInvoices] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingInvoiceId, setLoadingInvoiceId] = useState(null);

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = user?.role === "admin" ? "/invoices" : "/invoices/mine";
      const res = await api.get(endpoint);
      setInvoices(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || "Unable to load invoices.");
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    if (user?.role) {
      loadInvoices();
    }
  }, [user?.role, loadInvoices]);

  const openInvoicePdf = async (invoiceId, fileName, shouldDownload = false) => {
    try {
      const res = await api.get(`/invoices/${invoiceId}/pdf${shouldDownload ? "?download=1" : ""}`, {
        responseType: "blob",
      });
      const fileUrl = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));

      if (shouldDownload) {
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = fileName || `invoice-${invoiceId}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        window.open(fileUrl, "_blank", "noopener,noreferrer");
      }

      setTimeout(() => window.URL.revokeObjectURL(fileUrl), 3000);
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || "Unable to open invoice PDF.");
    }
  };

  const shareInvoiceToCustomer = async (invoiceId) => {
    try {
      setLoadingInvoiceId(invoiceId);
      const res = await api.put(`/invoices/${invoiceId}/share`);
      setMessage(res.data?.message || "Invoice shared to customer successfully.");
      await loadInvoices();
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || "Unable to share invoice.");
    } finally {
      setLoadingInvoiceId(null);
    }
  };

  return (
    <div className="brand-page">
      <Navbar />

      <section className="brand-container py-8">
        <div className="brand-panel brand-reveal px-6 py-8 md:px-10">
          <p className="brand-kicker">
            {user?.role === "admin" ? "Admin Invoice Center" : "Customer Invoice Center"}
          </p>
          <h1 className="brand-title mt-3">Invoices</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            View invoice details and download invoice PDFs generated automatically when orders are accepted.
          </p>

          {message && (
            <div className="brand-note brand-note-blue mt-5 text-sm">
              {message}
            </div>
          )}
        </div>
      </section>

      <section className="brand-container pb-12">
        <div className="brand-panel brand-reveal brand-reveal-2 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="brand-table min-w-[960px]">
              <thead className="text-left">
                <tr>
                  <th className="px-5 py-4 text-sm font-semibold">Invoice No</th>
                  <th className="px-5 py-4 text-sm font-semibold">Order ID</th>
                  <th className="px-5 py-4 text-sm font-semibold">Customer</th>
                  <th className="px-5 py-4 text-sm font-semibold">Dimensions</th>
                  <th className="px-5 py-4 text-sm font-semibold">Quantity</th>
                  <th className="px-5 py-4 text-sm font-semibold">Total</th>
                  <th className="px-5 py-4 text-sm font-semibold">Date</th>
                  <th className="px-5 py-4 text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {!loading && invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-5 py-4 text-sm font-semibold">{invoice.invoice_number}</td>
                      <td className="px-5 py-4 text-sm">{invoice.order_id}</td>
                      <td className="px-5 py-4 text-sm">
                        <div>{invoice.customer_name}</div>
                        <div className="text-slate-500">{invoice.customer_phone || "-"}</div>
                      </td>
                      <td className="px-5 py-4 text-sm">{invoice.box_dimensions || "-"}</td>
                      <td className="px-5 py-4 text-sm">{invoice.quantity}</td>
                      <td className="px-5 py-4 text-sm font-semibold">
                        Rs. {Number(invoice.total_amount || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {new Date(invoice.invoice_date || invoice.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="brand-button-dark px-4 py-2 text-xs"
                            onClick={() =>
                              openInvoicePdf(invoice.id, `${invoice.invoice_number}.pdf`, false)
                            }
                          >
                            View PDF
                          </button>
                          <button
                            className="brand-button px-4 py-2 text-xs"
                            onClick={() =>
                              openInvoicePdf(invoice.id, `${invoice.invoice_number}.pdf`, true)
                            }
                          >
                            Download PDF
                          </button>
                          {user?.role === "admin" && (
                            <button
                              className="brand-btn-3d brand-btn-blue px-4 py-2 text-xs"
                              onClick={() => shareInvoiceToCustomer(invoice.id)}
                              disabled={
                                loadingInvoiceId === invoice.id ||
                                Boolean(invoice.is_shared_with_customer)
                              }
                          >
                            {invoice.is_shared_with_customer
                              ? "Shared"
                              : loadingInvoiceId === invoice.id
                                ? "Sharing..."
                                : "Share To Customer"}
                          </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : !loading ? (
                  <tr>
                    <td colSpan="8" className="px-5 py-10 text-center text-sm text-slate-500">
                      No invoices found yet.
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan="8" className="px-5 py-10 text-center text-sm text-slate-500">
                      Loading invoices...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Invoices;
