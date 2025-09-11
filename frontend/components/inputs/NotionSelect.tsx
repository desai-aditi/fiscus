import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { generateRandomColor } from '@/utils/styling';
import { s, vs } from '@/utils/styling';
import Typo from '../Typo';

export interface Option {
  id: string;
  name: string;
  color: string;
}

interface NotionSelectProps {
  value: Option | null;
  options: Option[];
  placeholder?: string;
  onSelect: (option: Option) => void;
  onCreateNew: (name: string) => Promise<Option>;
  label?: string;
  error?: string;
}

export const NotionSelect: React.FC<NotionSelectProps> = ({
  value,
  options,
  placeholder = 'Select or create...',
  onSelect,
  onCreateNew,
  label,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelect = (option: Option) => {
    onSelect(option);
    setIsOpen(false);
    setSearchText('');
  };

  const handleCreateNew = async () => {
    if (!searchText.trim()) return;
    const newOption = await onCreateNew(searchText.trim());
    handleSelect(newOption);
  };

  const renderOption = (option: Option) => (
    <TouchableOpacity
      key={option.id}
      style={styles.option}
      onPress={() => handleSelect(option)}
    >
      <View style={[styles.colorDot, { backgroundColor: option.color }]} />
      <Text style={styles.optionText}>{option.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {label && <Typo size={14} style={styles.label}>{label}</Typo>}
      
      <TouchableOpacity
        style={[styles.selectButton, error ? styles.errorBorder : null]}
        onPress={() => setIsOpen(true)}
      >
        {value ? (
          <View style={styles.selectedValue}>
            <View style={[styles.colorDot, { backgroundColor: value.color }]} />
            <Text style={styles.selectedText}>{value.name}</Text>
          </View>
        ) : (
          <Text style={styles.placeholder}>{placeholder}</Text>
        )}
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search or create new..."
              autoFocus
            />

            <ScrollView style={styles.optionsList}>
              {filteredOptions.map(renderOption)}
              
              {searchText.trim() && !filteredOptions.some(
                opt => opt.name.toLowerCase() === searchText.toLowerCase()
              ) && (
                <TouchableOpacity
                  style={styles.createNewOption}
                  onPress={handleCreateNew}
                >
                  <Text style={styles.createNewText}>
                    Create "{searchText}"
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: s(4),
  },
  selectButton: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: s(8),
    padding: s(12),
    backgroundColor: '#FFFFFF',
  },
  errorBorder: {
    borderColor: '#FC8181',
  },
  selectedValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: s(16),
    height: s(16),
    borderRadius: s(8),
    marginRight: s(8),
  },
  selectedText: {
    fontSize: s(16),
    color: '#1A202C',
  },
  placeholder: {
    fontSize: s(16),
    color: '#A0AEC0',
  },
  errorText: {
    color: '#FC8181',
    fontSize: s(12),
    marginTop: s(4),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: s(12),
    width: '90%',
    maxHeight: '80%',
    padding: s(16),
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: s(8),
    padding: s(12),
    marginBottom: s(12),
    fontSize: s(16),
  },
  optionsList: {
    maxHeight: vs(300),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: s(12),
    borderRadius: s(8),
  },
  optionText: {
    fontSize: s(16),
    color: '#1A202C',
  },
  createNewOption: {
    padding: s(12),
    borderRadius: s(8),
    backgroundColor: '#F7FAFC',
    marginTop: s(8),
  },
  createNewText: {
    fontSize: s(16),
    color: '#4A5568',
    textAlign: 'center',
  },
});
