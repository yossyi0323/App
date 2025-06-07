import { render, screen, fireEvent } from '@testing-library/react';
import { PlaceSelector } from '@/components/inventory/place-selector';
import { PLACE_TYPE } from '@/lib/schemas/enums/place-type';
import { getCode } from '@/lib/utils/enum-utils';
import { LABELS } from '@/lib/constants/labels';

describe('PlaceSelector', () => {
  const mockPlaces = [
    {
      place_id: '1',
      place_name: '冷蔵庫',
      place_type: getCode(PLACE_TYPE, 'DESTINATION'),
      created_at: '2024-03-19T00:00:00Z',
      updated_at: '2024-03-19T00:00:00Z'
    },
    {
      place_id: '2',
      place_name: '冷凍庫',
      place_type: getCode(PLACE_TYPE, 'DESTINATION'),
      created_at: '2024-03-19T00:00:00Z',
      updated_at: '2024-03-19T00:00:00Z'
    }
  ];

  const defaultProps = {
    places: mockPlaces,
    selectedPlaceId: null,
    onPlaceChange: jest.fn(),
    type: getCode(PLACE_TYPE, 'DESTINATION'),
    className: 'w-full'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('プレースホルダーが正しく表示される', () => {
    render(<PlaceSelector {...defaultProps} />);
    expect(screen.getByText(LABELS.SELECT_PLACE)).toBeInTheDocument();
  });

  it('選択した場所が正しく表示される', () => {
    render(<PlaceSelector {...defaultProps} selectedPlaceId="1" />);
    expect(screen.getByText('冷蔵庫')).toBeInTheDocument();
  });

  it('場所の選択が正しく動作する', () => {
    render(<PlaceSelector {...defaultProps} />);
    const select = screen.getByRole('combobox');
    
    fireEvent.click(select);
    const option = screen.getByText('冷蔵庫');
    fireEvent.click(option);
    
    expect(defaultProps.onPlaceChange).toHaveBeenCalledWith('1');
  });

  it('指定されたtypeの場所のみが表示される', () => {
    const mixedPlaces = [
      ...mockPlaces,
      {
        place_id: '3',
        place_name: 'テスト場所3',
        place_type: getCode(PLACE_TYPE, 'SUPPLIER'),
        created_at: '2024-03-19T00:00:00Z',
        updated_at: '2024-03-19T00:00:00Z'
      }
    ];

    render(<PlaceSelector {...defaultProps} places={mixedPlaces} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    
    expect(screen.getByText('冷蔵庫')).toBeInTheDocument();
    expect(screen.getByText('冷凍庫')).toBeInTheDocument();
    expect(screen.queryByText('テスト場所3')).not.toBeInTheDocument();
  });
}); 