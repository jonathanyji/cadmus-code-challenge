import React, { useEffect, useState } from 'react';
import { NotesApiService } from '../services/NotesApiService';
import RichTextEditor from './RichTextEditor';

const NotesComponent = () => {
  const [items, setItems] = useState([]);

  // Function to fetch all items
  const fetchItems = async () => {
    try {
      const data = await NotesApiService.listNotesApi()
      setItems(data);
      console.log("TEST DATA: ")
      console.log("TEST DATA: ", data)
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  // Call fetchItems when the component mounts
  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div>
      <h1>My Notes</h1>
      <RichTextEditor/>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default NotesComponent;