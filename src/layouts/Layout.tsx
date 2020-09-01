import * as React from 'react';
import { Footer } from './Footer';
import './styles.scss';
const LayoutBase:React.FC<{children:React.ReactNode}> = (
    {
        children
    }
) => {
    return(
        <div className='Layout'>
            <main className='LayoutBody'>
                {children}
            </main>
            <Footer/>
        </div>
    )
}
export const Layout = React.memo(LayoutBase);