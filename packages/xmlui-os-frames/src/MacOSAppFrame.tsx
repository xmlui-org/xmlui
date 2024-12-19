import styles from "./MacOSAppFrame.module.scss";

export function MacOSAppFrame({ children }) {
  return (
    <section role="application" className={styles.app} tabIndex={-1}>
      <div className={styles.appButtons}>
        <div className={styles.appButtonsInner}>
          <button className={`${styles.close} ${styles.button}`}>
            <svg width="7" height="7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                stroke="#000"
                strokeWidth="1.2"
                strokeLinecap="round"
                d="M1.182 5.99L5.99 1.182m0 4.95L1.182 1.323"
              ></path>
            </svg>
          </button>
          <button className={`${styles.minimize} ${styles.button}`}>
            <svg fill="none" xmlns="http://www.w3.org/2000/svg" width="6" height="1">
              <path stroke="#000" strokeLinecap="round" d="M.61.703h5.8" strokeWidth="2"></path>
            </svg>
          </button>
          <button className={`${styles.stretch} ${styles.button}`}>
            <svg
              viewBox="0 0 13 13"
              xmlns="http://www.w3.org/2000/svg"
              fillRule="evenodd"
              clipRule="evenodd"
              strokeLinejoin="round"
              strokeMiterlimit="2"
            >
              <path d="M4.871 3.553L9.37 8.098V3.553H4.871zm3.134 5.769L3.506 4.777v4.545h4.499z"></path>
              <circle fill="none" cx="6.438" cy="6.438" r="6.438"></circle>
            </svg>
          </button>
        </div>
      </div>
      <section className={styles.container}>
        <header className={styles.titleBar}>
          <span className="s-85680v">XMLUI</span>
        </header>
        <section className={styles.mainArea}>{children}</section>
      </section>
    </section>
  );
}
