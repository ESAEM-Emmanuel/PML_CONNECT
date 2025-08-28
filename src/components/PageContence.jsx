// // src/components/Page.jsx
// export default function PageContence({ children }) {
//     return (
//       <section className="min-h-[calc(100vh-64px)] flex items-start justify-center">
//         <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
//           {children}
//         </div>
//       </section>
//     )
//   }
// Dans PageContence.jsx
export default function PageContence({ children }) {
  return (
    <section className="min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl w-full px-2 sm:px-4 lg:px-6 py-4">
        {children}
      </div>
    </section>
  )
}