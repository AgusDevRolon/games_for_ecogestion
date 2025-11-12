import React, {useState} from 'react';
export default function City(){
  const [bins, setBins] = useState([]); // {id,x}
  const [money, setMoney] = useState(1000);
  const [pollution, setPollution] = useState(50); // 0-100
  const placeBin = (type)=>{
    if(money<200){alert('No hay dinero suficiente.'); return;}
    const id=Date.now(); setBins(b=>[...b,{id,type,x:Math.random()*80+10}]); setMoney(m=>m-200);
    setPollution(p=>Math.max(0,p-8));
  };
  const nextTurn = ()=>{
    // simulate increase in waste; bins decrease pollution depending on count
    const effect = bins.length*5;
    setPollution(p=>Math.min(100,p+10-effect));
    setMoney(m=>m+100);
  };
  return (<div>
    <div style={{display:'flex',gap:8,marginBottom:8}}><div>Dinero: <strong>${money}</strong></div><div>Contaminación: <strong>{pollution}%</strong></div></div>
    <div style={{display:'flex',gap:8}}>
      <div style={{flex:1,background:'#fff',padding:12,borderRadius:8,boxShadow:'0 6px 18px rgba(0,0,0,0.06)'}}>
        <div style={{height:260,position:'relative',borderRadius:8,background:'linear-gradient(180deg,#e6f7ff,#fff)'}}>
          {bins.map(b=>(<div key={b.id} style={{position:'absolute',left:`${b.x}%`,bottom:14,transform:'translateX(-50%)'}}><div style={{width:48,height:48,borderRadius:8,background:'#f8fafc',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 6px 12px rgba(0,0,0,0.06)'}}>🗑️</div></div>))}
        </div>
      </div>
      <div style={{width:260,background:'#fff',padding:12,borderRadius:8,boxShadow:'0 6px 18px rgba(0,0,0,0.06)'}}>
        <h5>Acciones</h5>
        <button className="btn btn-success mb-2" onClick={()=>placeBin('Reciclable')}>Colocar tacho reciclable ($200)</button><br/>
        <button className="btn btn-warning mb-2" onClick={()=>placeBin('Orgánico')}>Colocar tacho orgánico ($200)</button><br/>
        <button className="btn btn-secondary mb-2" onClick={()=>placeBin('Resto')}>Colocar tacho resto ($200)</button><br/>
        <hr/>
        <button className="btn btn-primary" onClick={nextTurn}>Simular turno</button>
      </div>
    </div>
    <div style={{marginTop:8}} className="small-muted">Coloca tachos y reduce la contaminación. Ganás dinero cada turno.</div>
  </div>); }