import React, { useState } from 'react';
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

interface NotionMultiSelectProps {
  value: Option[];
  options: Option[];
  placeholder?: string;
  onSelect: (options: Option[]) => void;
  onCreateNew: (name: string) => Promise<Option>;
  label?: string;
  error?: string;
}

export const NotionMultiSelect: React.FC<NotionMultiSelectProps> = ({
  value,
  options,
  placeholder = 'Select or create tags...',
  onSelect,
  onCreateNew,
  label,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const isSelected = (option: Option) =>
    value.some(item => item.id === option.id);

  const handleToggleOption = (option: Option) => {
    const newValue = isSelected(option)
      ? value.filter(item => item.id !== option.id)
      : [...value, option];
    onSelect(newValue);
  };

  const handleCreateNew = async () => {
    if (!searchText.trim()) return;
    const newOption = await onCreateNew(searchText.trim());
    onSelect([...value, newOption]);
    setSearchText('');
  };

  const renderOption = (option: Option) => {
    const selected = isSelected(option);
    return (
      <TouchableOpacity
        key={option.id}
        style={[styles.option, selected ? styles.selectedOption : null]}
        onPress={() => handleToggleOption(option)}
      >
        <View style={[styles.colorDot, { backgroundColor: option.color }]} />
        <Text style={[styles.optionText, selected ? styles.selectedOptionText : null]}>
          {option.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTag = (option: Option) => (
    <View key={option.id} style={[styles.tag, { backgroundColor: option.color + '20' }]}>
      <View style={[styles.tagDot, { backgroundColor: option.color }]} />
      <Text style={[styles.tagText, { color: option.color }]}>{option.name}</Text>
      <TouchableOpacity
        style={styles.tagRemove}
        onPress={() => handleToggleOption(option)}
      >
        <Text style={[styles.tagRemoveText, { color: option.color }]}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {label && <Typo size={14} style={styles.label}>{label}</Typo>}
      
      <TouchableOpacity
        style={[styles.selectButton, error ? styles.errorBorder : null]}
        onPress={() => setIsOpen(true)}
      >
        {value.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tagsContainer}
          >
            {value.map(renderTag)}
          </ScrollView>
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
    minHeight: s(48),
    backgroundColor: '#FFFFFF',
  },
  errorBorder: {
    borderColor: '#FC8181',
  },
  tagsContainer: {
    flexDirection: 'row',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: s(16),
    paddingHorizontal: s(8),
    paddingVertical: s(4),
    marginRight: s(8),
  },
  tagDot: {
    width: s(8),
    height: s(8),
    borderRadius: s(4),
    marginRight: s(4),
  },
  tagText: {
    fontSize: s(14),
    marginRight: s(4),
  },
  tagRemove: {
    padding: s(2),
  },
  tagRemoveText: {
    fontSize: s(16),
    fontWeight: 'bold',
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
  selectedOption: {
    backgroundColor: '#F7FAFC',
  },
  colorDot: {
    width: s(16),
    height: s(16),
    borderRadius: s(8),
    marginRight: s(8),
  },
  optionText: {
    fontSize: s(16),
    color: '#1A202C',
  },
  selectedOptionText: {
    fontWeight: '500',
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
