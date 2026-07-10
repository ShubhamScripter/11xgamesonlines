import { useState } from 'react'
import React from 'react'
import HeaderLogin from '../../components/Header/HeaderLogin'
import Header1 from '../../components/Header/Header1'
import All from './All'
import Cricket from './Cricket'
import Soccer from './Soccer'
import Tennis from './Tennis'
import { useTranslation } from '../../i18n/LanguageContext';

function Leagues() {
    const { t } = useTranslation();
    const [Filter,setFilter] = useState("All")
    const [selected, setSelected] = useState(null);
    let content;
    if (Filter === "All") {
        content = <All selected={selected} setSelected={setSelected} />;
    } else if (Filter === "Cricket") {
        content = <Cricket selected={selected} setSelected={setSelected} />;
    } else if (Filter === "Soccer") {
        content = <Soccer selected={selected} setSelected={setSelected} />;
    } else if (Filter === "Tennis") {
        content = <Tennis selected={selected} setSelected={setSelected} />;
    }
     else {
        content = <div className="p-4">{t('leagues.noComponentFor', { name: Filter })}</div>;
    }

  return (
    <div>
        <HeaderLogin/>
        {!selected && <Header1 Filter={Filter} setFilter={setFilter}/>}
        {content}
    </div>
  )
}

export default Leagues